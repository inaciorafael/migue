import http from "http";
import { MigueEngine } from "../../../packages/engine/src";
import { MockStore } from "../../../packages/mocks/src";

export function startServer(mocksPath: string, backend: string, port: number) {
  const store = new MockStore(mocksPath);
  const engine = new MigueEngine(store, backend);

  const server = http.createServer((req, res) => {
    engine.handle(req, res);
  });

  server.listen(port, () => {
    if (port) {
      console.log(`🧉 MIGUÉ rodando em http://localhost:${port}`);
    }

    if (backend) {
      console.log(`🎯 Backend: ${backend}`);
    }

    console.log(`📂 Mocks: ${mocksPath}`);
  });
}
