import { evaluateExpression } from "./TemplateRuntime";

const TEMPLATE_REGEX = /^\{\{(.+)\}\}$/;

export function interpolate(value: any, ctx: any): any {
  // string template
  if (typeof value === "string") {
    const match = value.match(TEMPLATE_REGEX);

    if (match) {
      return evaluateExpression(match[1].trim(), ctx);
    }

    return value;
  }

  // array
  if (Array.isArray(value)) {
    return value.map((v) => interpolate(v, ctx));
  }

  // object (O PONTO CRÍTICO AQUI)
  if (typeof value === "object" && value !== null) {
    const result: any = {};

    for (const key of Object.keys(value)) {
      // 🔥 O RESULTADO PARCIAL VIRA CONTEXTO
      result[key] = interpolate(value[key], {
        ...ctx,
        ...result,
      });
    }

    return result;
  }

  return value;
}
