import axios from "axios";
import https from "https";
import { MockStore } from "../../mocks/src";
import { findMatchingRule } from "./Matcher";
import { templateHelpers } from "../../runtime/helpers";
import { RuntimeCtx } from "../../schema/src/defineMock";

import { createRequestContext } from "./createRequestContext";
import { RequestContext } from "./RequestContext";
import { Middleware } from "./middleware";
import { createLoggerMiddleware } from "./middlewares/loggerMiddleware";

export class MigueEngine {
  private middlewares: Middleware[] = [];

  constructor(
    private store: MockStore,
    private backend?: string,
  ) {
    this.use(createLoggerMiddleware());
    this.use(this.createMockMiddleware());
    this.use(this.createProxyMiddleware());
  }

  public use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  private async runMiddlewares(ctx: RequestContext) {
    let index = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error("next() chamado múltiplas vezes");
      }

      index = i;

      const middleware = this.middlewares[i];
      if (!middleware) return;

      await middleware(ctx, () => dispatch(i + 1));
    };

    await dispatch(0);
  }

  async handle(req: any, res: any) {
    if (this.handlePreflight(req, res)) return;

    this.setCorsHeaders(res);

    const ctx = await createRequestContext(req, res);

    await this.runMiddlewares(ctx);

    // if (await this.tryHandleMock(ctx)) return;
    //
    // if (await this.tryProxyToBackend(ctx)) return;
    //
    // this.sendJson(res, 404, {
    //   error: "Not Found",
    //   message: "No mock and no backend configured",
    // });
  }

  private handlePreflight(req: any, res: any): boolean {
    if (req.method === "OPTIONS") {
      this.setCorsHeaders(res);
      res.writeHead(204);
      res.end();
      return true;
    }

    if (req.url === "/favicon.ico") {
      res.writeHead(204);
      res.end();
      return true;
    }

    return false;
  }

  private setCorsHeaders(res: any) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
  }

  private createMockMiddleware(): Middleware {
    return async (ctx, next) => {
      const matchResult = findMatchingRule(
        this.store.getRules(),
        ctx.method,
        ctx.pathname,
        ctx.query,
        ctx.body,
      );

      if (!matchResult) return next();

      const { rule, params, query: queryResult } = matchResult;

      if (rule.delay) {
        await this.applyDelay(rule.delay);
      }

      const runtimeContext: RuntimeCtx = {
        ...templateHelpers,
        params,
        query: queryResult,
        body: ctx.body,
      };

      const resolvedResponse =
        typeof rule.response === "function"
          ? rule.response(runtimeContext)
          : rule.response;

      const resolvedError =
        typeof rule.error === "function"
          ? rule.error(runtimeContext)
          : rule.error;

      ctx.res.setHeader("X-MIGUE", "true");

      if (rule.triggerError) {
        this.sendJson(
          ctx.res,
          resolvedError?.status || 500,
          resolvedError?.body,
        );
        return;
      }

      this.sendJson(
        ctx.res,
        resolvedResponse.status || 200,
        resolvedResponse.body,
      );
    };
  }

  private createProxyMiddleware(): Middleware {
    return async (ctx, next) => {
      if (!this.backend) return next();

      const headers = {
        ...ctx.req.headers,
        host: undefined,
        "content-length": undefined,
      };

      try {
        const response = await axios({
          url: this.backend + ctx.pathname + ctx.url.search,
          method: ctx.req.method,
          headers,
          data: ctx.body,
          validateStatus: () => true,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
            family: 4,
          }),
          withCredentials: true,
          timeout: 15000,
        });

        ctx.res.writeHead(response.status, response.headers);

        if (Buffer.isBuffer(response.data)) {
          ctx.res.end(response.data);
        } else if (typeof response.data === "object") {
          ctx.res.end(JSON.stringify(response.data));
        } else {
          ctx.res.end(response.data);
        }
      } catch (error) {
        console.error("Erro no proxy para backend:", error);

        this.sendJson(ctx.res, 502, {
          error: "Bad Gateway",
          message: "Falha ao comunicar com backend",
        });
      }
    };
  }

  private async applyDelay(delay?: number) {
    if (!delay || delay <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  private sendJson(res: any, status: number, body: any) {
    res.writeHead(status, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify(body));
  }
}
