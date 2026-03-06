import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";
import {
  type ShieldBasicAuthConfig,
  ShieldBasicAuthStrategy,
  ShieldBasicAuthStrategyError,
} from "./shield-basic-auth.strategy";

export class ShieldBasicAuthExpressStrategy implements MiddlewareExpressPort {
  private readonly strategy: ShieldBasicAuthStrategy;

  constructor(config: ShieldBasicAuthConfig) {
    this.strategy = new ShieldBasicAuthStrategy(config);
  }

  handle(): RequestHandler {
    return (request, response, next) => {
      const context = new RequestContextExpressAdapter(request);

      if (this.strategy.evaluate(context)) return next();

      response.status(401).send(ShieldBasicAuthStrategyError.Rejected);
    };
  }
}
