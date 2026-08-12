import { createMiddleware } from "hono/factory";
import { CorrelationMiddleware, type CorrelationMiddlewareDependencies } from "./correlation.middleware";
import type { CorrelationIdType } from "./correlation-id.vo";
import { CorrelationStorage } from "./correlation-storage.service";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

export type CorrelationVariables = { correlationId: CorrelationIdType };

export class CorrelationHonoMiddleware implements MiddlewareHonoPort {
  private readonly correlationId: CorrelationMiddleware;

  constructor(deps: CorrelationMiddlewareDependencies) {
    this.correlationId = new CorrelationMiddleware(deps);
  }

  handle() {
    return createMiddleware<{ Variables: CorrelationVariables }>(async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      const result = this.correlationId.evaluate(context);

      c.set("correlationId", result);

      return CorrelationStorage.run(result, async () => {
        await next();

        c.header(CorrelationMiddleware.HEADER_NAME, result);
      });
    });
  }
}
