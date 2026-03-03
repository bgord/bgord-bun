import type { MiddlewareHandler } from "hono";
import type { MiddlewareHonoPort } from "./middleware-hono.port";

export class MiddlewareHonoNoopAdapter implements MiddlewareHonoPort {
  handle(): MiddlewareHandler {
    return async (_c, next) => next();
  }
}
