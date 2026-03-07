import type * as tools from "@bgord/tools";
import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import type { SleeperPort } from "./sleeper.port";
import { SlowerMiddleware } from "./slower.middleware";

type Dependencies = { Sleeper: SleeperPort };

export class SlowerExpressMiddleware implements MiddlewareExpressPort {
  private readonly middleware: SlowerMiddleware;

  constructor(offset: tools.Duration, deps: Dependencies) {
    this.middleware = new SlowerMiddleware(offset, deps);
  }

  handle(): RequestHandler {
    return async (_request, _response, next) => {
      await this.middleware.evaluate();

      return next();
    };
  }
}
