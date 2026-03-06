import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";
import {
  type ApiKeyShieldConfig,
  ShieldApiKeyStrategy,
  ShieldApiKeyStrategyError,
} from "./shield-api-key.strategy";

export class ShieldApiKeyExpressStrategy implements MiddlewareExpressPort {
  private readonly strategy: ShieldApiKeyStrategy;

  constructor(config: ApiKeyShieldConfig) {
    this.strategy = new ShieldApiKeyStrategy(config);
  }

  handle(): RequestHandler {
    return (request, response, next) => {
      const context = new RequestContextExpressAdapter(request);

      if (this.strategy.evaluate(context)) return next();

      response.status(403).json({ message: ShieldApiKeyStrategyError.Rejected, _known: true });
    };
  }
}
