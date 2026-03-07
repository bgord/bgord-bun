import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import {
  type ShieldTimeoutConfig,
  ShieldTimeoutStrategy,
  ShieldTimeoutStrategyError,
} from "./shield-timeout.strategy";

export class ShieldTimeoutExpressStrategy implements MiddlewareExpressPort {
  private readonly strategy: ShieldTimeoutStrategy;

  constructor(config: ShieldTimeoutConfig) {
    this.strategy = new ShieldTimeoutStrategy(config);
  }

  handle(): RequestHandler {
    return (_, response, next) => {
      const timer = setTimeout(() => {
        if (!response.headersSent) {
          response.status(408).json({ message: ShieldTimeoutStrategyError.Rejected });
        }
      }, this.strategy.config.duration.ms);

      response.on("finish", () => clearTimeout(timer));
      response.on("close", () => clearTimeout(timer));

      next();
    };
  }
}
