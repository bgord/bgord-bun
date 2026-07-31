import type * as tools from "@bgord/tools";
import type { MiddlewareHandler } from "hono";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { SlowerMiddleware, type SlowerMiddlewareDependencies } from "./slower.middleware";

export class SlowerHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: SlowerMiddleware;

  constructor(offset: tools.Duration, deps: SlowerMiddlewareDependencies) {
    this.middleware = new SlowerMiddleware(offset, deps);
  }

  handle(): MiddlewareHandler {
    return async (_c, next) => {
      await this.middleware.evaluate();

      return next();
    };
  }
}
