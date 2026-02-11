import httpProxy from "http-proxy";
import getRawBody from "raw-body";
import { MockStore } from "../../mocks/src";
import { findMatchingRule } from "./Matcher";
import { interpolate } from "../../runtime";

export class MigueEngine {
  private proxy = httpProxy.createProxyServer({});
  private backend: string;
  private store: MockStore;

  constructor(store: MockStore, backend: string) {
    this.store = store;
    this.backend = backend;
  }

  async handle(req: any, res: any) {
    const start = Date.now();

    const bodyBuffer = await getRawBody(req);
    const bodyString = bodyBuffer.toString() || "{}";
    const body = JSON.parse(bodyString);

    const url = new URL(req.url!, "http://localhost");
    const query = Object.fromEntries(url.searchParams.entries());

    const matchResult = findMatchingRule(
      this.store.getRules(),
      req.method,
      url.pathname,
      query,
      body,
    );

    if (matchResult) {
      const { rule, params } = matchResult;

      if (rule.response.delay) {
        await new Promise((r) => setTimeout(r, rule.response.delay));
      }

      res.writeHead(rule.response.status, {
        "content-type": "application/json",
      });

      const runtimeContext = {
        params,
        // query,
        match: rule.match,
        body,
      }

      const bodyResponse = interpolate(rule.response.body, runtimeContext);

      res.end(JSON.stringify(bodyResponse));
      const time = Date.now() - start;

      console.log(
        `[MIGUÉ] ${req.method} ${url.pathname} → ${rule.id} (${rule.response.status}) ${time}ms`,
      );
      return;
    }

    if (this.backend) {
      this.proxy.web(req, res, { target: this.backend });

      res.on("finish", () => {
        const time = Date.now() - start;
        console.log(
          `[MIGUÉ] ${req.method} ${url.pathname} → proxy ${this.backend} (${time}ms)`,
        );
      });

      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Mock não encontrado e backend não configurado",
      }),
    );

    const time = Date.now() - start;

    console.log(
      `[MIGUÉ] ${req.method} ${url.pathname} → NO MOCK, NO BACKEND (404) ${time}ms`,
    );
  }
}
