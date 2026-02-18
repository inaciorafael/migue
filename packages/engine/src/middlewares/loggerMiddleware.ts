import { Middleware } from "../middleware";

export function createLoggerMiddleware(): Middleware {
  return async (ctx, next) => {
    const start = Date.now();

    let statusCode: number | undefined;
    let source = "UNKNOWN";

    const originalWriteHead = ctx.res.writeHead;
    ctx.res.writeHead = function(status: number, ...args: any[]) {
      statusCode = status;
      return originalWriteHead.call(this, status, ...args);
    };

    const originalEnd = ctx.res.end;
    ctx.res.end = function(...args: any[]) {
      const duration = Date.now() - start;

      if (ctx.res.getHeader("X-MIGUE")) {
        source = "MOCK";
      } else {
        source = "BACKEND";
      }

      console.log(
        `[${ctx.method}] ${ctx.pathname} → ${statusCode} (${duration}ms) [${source}]`,
      );

      return originalEnd.apply(this, args);
    };

    await next();
  };
}
