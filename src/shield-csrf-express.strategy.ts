import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";
import { type ShieldCsrfConfig, ShieldCsrfStrategy, ShieldCsrfStrategyError } from "./shield-csrf.strategy";

export class ShieldCsrfExpressStrategy implements MiddlewareExpressPort {
  private readonly strategy: ShieldCsrfStrategy;

  constructor(config: ShieldCsrfConfig) {
    this.strategy = new ShieldCsrfStrategy(config);
  }

  handle(): RequestHandler {
    return (request, response, next) => {
      const context = new RequestContextExpressAdapter(request);

      if (this.strategy.evaluate(context)) return next();

      response.status(403).send(ShieldCsrfStrategyError.Rejected);
    };
  }
}
