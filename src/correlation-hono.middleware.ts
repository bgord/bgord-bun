import { createMiddleware } from "hono/factory";
import { CorrelationStorage } from "./correlation-storage.service";
import type { IdProviderPort } from "./id-provider.port";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import { RequestIdMiddleware } from "./request-id.middleware";
import type { UUIDType } from "./uuid.vo";

type Dependencies = { IdProvider: IdProviderPort };

export type CorrelationVariables = { requestId: UUIDType };

export class CorrelationHonoMiddleware implements MiddlewareHonoPort {
  private readonly requestId: RequestIdMiddleware;

  constructor(deps: Dependencies) {
    this.requestId = new RequestIdMiddleware(deps);
  }

  handle() {
    return createMiddleware(async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      const result = this.requestId.evaluate(context);

      c.set("requestId", result);
      c.header(RequestIdMiddleware.HEADER_NAME, result);

      return CorrelationStorage.run(result, next);
    });
  }
}
