import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import { parseMockRules, MockRule } from "../../schema/src";

export class MockStore {
  private rules: MockRule[] = [];
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.load();
    this.watch();
  }

  load() {
    try {
      const absolutePath = path.isAbsolute(this.filePath)
        ? this.filePath
        : path.resolve(process.cwd(), this.filePath);

      const raw = fs.readFileSync(absolutePath, "utf-8");
      const json = JSON.parse(raw);

      this.rules = parseMockRules(json);

      console.log("[MIGUÉ] Mocks carregados:", this.rules.length);
    } catch (err) {
      console.error("[MIGUÉ] Erro ao carregar mocks:", err);
      this.rules = [];
    }
  }

  watch() {
    chokidar.watch(this.filePath).on("change", () => {
      console.log("[MIGUÉ] mocks.json alterado, recarregando...");
      this.load();
    });
  }

  getRules() {
    return this.rules;
  }
}
