import { createMiddleware } from "hono/factory";
import type { IdProviderPort } from "./id-provider.port";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import { RequestIdMiddleware } from "./request-id.middleware";
import type { UUIDType } from "./uuid.vo";

type Dependencies = { IdProvider: IdProviderPort };

export type RequestIdVariables = { requestId: UUIDType };

export class RequestIdHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: RequestIdMiddleware;

  constructor(deps: Dependencies) {
    this.middleware = new RequestIdMiddleware(deps);
  }

  handle() {
    return createMiddleware(async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      const requestId = this.middleware.evaluate(context);

      c.set("requestId", requestId);
      c.header(RequestIdMiddleware.HEADER_NAME, requestId);

      await next();
    });
  }
}
