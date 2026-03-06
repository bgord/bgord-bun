import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";
import {
  type ShieldBodyLimitConfig,
  ShieldBodyLimitError,
  ShieldBodyLimitStrategy,
} from "./shield-body-limit.strategy";

export class ShieldBodyLimitExpressStrategy implements MiddlewareExpressPort {
  private readonly strategy: ShieldBodyLimitStrategy;

  constructor(config: ShieldBodyLimitConfig) {
    this.strategy = new ShieldBodyLimitStrategy(config);
  }

  handle(): RequestHandler {
    return (request, response, next) => {
      const context = new RequestContextExpressAdapter(request);

      const result = this.strategy.evaluate(context);

      if (!result) return response.status(413).send(ShieldBodyLimitError.TooBig);
      return next();
    };
  }
}
