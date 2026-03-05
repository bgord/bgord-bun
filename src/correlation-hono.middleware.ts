import { createMiddleware } from "hono/factory";
import { CorrelationIdMiddleware } from "./correlation-id.middleware";
import { CorrelationStorage } from "./correlation-storage.service";
import type { IdProviderPort } from "./id-provider.port";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import type { UUIDType } from "./uuid.vo";

type Dependencies = { IdProvider: IdProviderPort };

export type CorrelationVariables = { correlationId: UUIDType };

export class CorrelationHonoMiddleware implements MiddlewareHonoPort {
  private readonly correlationId: CorrelationIdMiddleware;

  constructor(deps: Dependencies) {
    this.correlationId = new CorrelationIdMiddleware(deps);
  }

  handle() {
    return createMiddleware(async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      const result = this.correlationId.evaluate(context);

      c.set("correlationId", result);
      c.header(CorrelationIdMiddleware.HEADER_NAME, result);

      return CorrelationStorage.run(result, next);
    });
  }
}
