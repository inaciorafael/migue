import vm from "node:vm";
import { baseHelpers } from "./helpers";
import { faker } from "@faker-js/faker";

export function evaluateExpression(
  expression: string,
  context: Record<string, any>,
) {
  const sandbox = {
    ...baseHelpers,
    faker,
    ...context,
  };

  console.log({ sandbox })

  const script = new vm.Script(expression);
  const ctx = vm.createContext(sandbox);

  return script.runInContext(ctx);
}
