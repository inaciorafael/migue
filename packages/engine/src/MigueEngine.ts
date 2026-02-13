import getRawBody from "raw-body";
import axios from "axios";
import { MockStore } from "../../mocks/src";
import { findMatchingRule } from "./Matcher";
import https from "https";
import { templateHelpers } from "../../runtime/helpers";
import { RuntimeCtx } from "../../schema/src/defineMock";

export class MigueEngine {
  private backend: string;
  private store: MockStore;

  constructor(store: MockStore, backend: string) {
    this.store = store;
    this.backend = backend;
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

  async handle(req: any, res: any) {
    // Handle preflight requests primeiro
    if (req.method === "OPTIONS") {
      this.setCorsHeaders(res);
      res.writeHead(204);
      res.end();
      return;
    }

    // Ignora favicon
    if (req.url === "/favicon.ico") {
      res.writeHead(204);
      res.end();
      return;
    }

    // Sempre seta CORS headers para todas as respostas
    this.setCorsHeaders(res);

    const bodyBuffer = await getRawBody(req).catch(() => Buffer.from(""));
    const body = bodyBuffer.length ? JSON.parse(bodyBuffer.toString()) : {};

    const url = new URL(req.url!, "http://localhost");
    const query = Object.fromEntries(url.searchParams.entries());

    const matchResult = findMatchingRule(
      this.store.getRules(),
      req.method,
      url.pathname,
      query,
      body,
    );

    console.log({
      matchResult,
      url,
      query,
      rules: this.store.getRules(),
    });

    // CASO 1: Mock encontrado
    if (matchResult) {
      const { rule, params, query: queryResult } = matchResult;

      const runtimeContext: RuntimeCtx = {
        ...templateHelpers,
        params,
        query: queryResult,
        body,
      };

      const resolvedResponse =
        typeof rule.response === "function"
          ? rule.response(runtimeContext)
          : rule.response;

      const resolvedError =
        typeof rule.error === "function"
          ? rule.error(runtimeContext)
          : rule.error;

      if (rule.triggerError) {
        res.writeHead(resolvedError?.status || 500, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            ...resolvedError.body,
            _MIGUE_: { message: "MIGUE FORCED ERROR" },
          }),
        );
        return;
      }

      res.writeHead(resolvedResponse.status || 200, {
        "Content-Type": "application/json",
      });

      res.end(
        JSON.stringify({
          ...resolvedResponse.body,
          _MIGUE_: true,
        }),
      );
      return;
    }

    // CASO 2: Backend real
    if (this.backend) {
      const headers = {
        ...req.headers,
        host: undefined,
        "content-length": undefined,
      };

      try {
        const response = await axios({
          url: this.backend + url.pathname + url.search,
          method: req.method,
          headers: headers,
          data: body,
          validateStatus: () => true,
          httpsAgent: new https.Agent({ rejectUnauthorized: false, family: 4 }),
          withCredentials: true,
          timeout: 15000,
        });

        // PASSO CRÍTICO: Replicar headers CORS na resposta
        // IMPORTANTE: Não sobrescrever os headers CORS que já setamos
        const responseHeaders = {
          "Content-Type": "application/json",
          // Se o backend retornar headers CORS específicos, você pode querer propagá-los
          // Mas como já setamos *, mantemos assim
        };

        res.writeHead(response.status, responseHeaders);
        res.end(JSON.stringify(response.data));
        return;

      } catch (error) {
        console.error("Erro no proxy para backend:", error);

        // Em caso de erro, ainda mantém CORS
        res.writeHead(502, {
          "Content-Type": "application/json",
        });

        res.end(JSON.stringify({
          error: "Bad Gateway",
          message: "Falha ao comunicar com backend",
        }));
        return;
      }
    }

    // CASO 3: Sem mock e sem backend
    res.writeHead(404, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify({
      error: "Not Found",
      message: "No mock and no backend configured",
    }));
  }
}
