import getRawBody from "raw-body";
import axios from "axios";
import { MockStore } from "../../mocks/src";
import { findMatchingRule } from "./Matcher";
import { interpolate } from "../../runtime";
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

  async handle(req: any, res: any) {
    if (req.method === "OPTIONS" || req.url === "/favicon.ico") {
      res.writeHead(204);
      res.end();
      return;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );

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

      // const bodyInterpolated = interpolate(
      //   resolvedResponse.body,
      //   runtimeContext,
      // );
      //
      // const bodyResponse = interpolate(bodyInterpolated, {
      //   ...runtimeContext,
      //   body: bodyInterpolated,
      // });

      if (rule.triggerError) {
        const errorBody = interpolate(resolvedError?.body, runtimeContext);

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

    if (this.backend) {
      const headers = {
        ...req.headers,
        host: undefined,
        "content-length": undefined,
      };

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

      res.writeHead(response.status, {
        "Content-Type": "application/json",
      });

      res.end(JSON.stringify(response.data));
      return;
    }

    res.writeHead(404);
    res.end("No mock and no backend");
  }
}
