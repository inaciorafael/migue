import vm from "node:vm";
import { TemplateHelpers } from "./helpers";

export function evaluateExpression(
  expression: string,
  context: Record<string, any>,
) {
  const sandbox = {
    ...TemplateHelpers,
    ...context,
  };

  const script = new vm.Script(expression);
  const ctx = vm.createContext(sandbox);

  return script.runInContext(ctx);
}
