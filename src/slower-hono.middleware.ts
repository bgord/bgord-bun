import type * as tools from "@bgord/tools";
import type { MiddlewareHandler } from "hono";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import type { SleeperPort } from "./sleeper.port";
import { SlowerMiddleware } from "./slower.middleware";

type Dependencies = { Sleeper: SleeperPort };

export class SlowerHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: SlowerMiddleware;

  constructor(offset: tools.Duration, deps: Dependencies) {
    this.middleware = new SlowerMiddleware(offset, deps);
  }

  handle(): MiddlewareHandler {
    return async (_c, next) => {
      await this.middleware.evaluate();

      return next();
    };
  }
}
