import getRawBody from "raw-body";
import axios from "axios";
import { MockStore } from "../../mocks/src";
import { findMatchingRule } from "./Matcher";
import { interpolate } from "../../runtime";
import https from "https";

const insecureAgent = new https.Agent({
  rejectUnauthorized: false,
  family: 4,
});

export class MigueEngine {
  private backend: string;
  private store: MockStore;

  constructor(store: MockStore, backend: string) {
    this.store = store;
    this.backend = backend;
  }

  async handle(req: any, res: any) {
    // CORS GLOBAL
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

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

    // 🎭 MOCK
    if (matchResult) {
      const { rule, params } = matchResult;

      const runtimeContext = { params, query, match: rule.match, body };
      const bodyResponse = interpolate(rule.response.body, runtimeContext);

      res.writeHead(rule.response.status, {
        "Content-Type": "application/json",
      });

      res.end(JSON.stringify(bodyResponse));
      return;
    }

    // 🌐 BACKEND REAL (AXIOS)
    if (this.backend) {
      const headers = {
        ...req.headers, // repassa todos headers originais
        host: undefined, // evita conflito de host
        "content-length": undefined, // Axios recalcula
      };

      const response = await axios({
        url: this.backend + url.pathname + url.search,
        method: req.method,
        headers: headers,
        data: body,
        validateStatus: () => true,
        httpsAgent: new https.Agent({ rejectUnauthorized: false, family: 4 }),
        withCredentials: true, // envia cookies
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
