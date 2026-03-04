import { createMiddleware } from "hono/factory";
import { CorrelationStorage } from "./correlation-storage.service";
import type { MiddlewareHonoPort } from "./middleware-hono.port";

export class CorrelationStorageHonoMiddleware implements MiddlewareHonoPort {
  handle() {
    return createMiddleware(async (c, next) => CorrelationStorage.run(c.get("requestId"), next));
  }
}
