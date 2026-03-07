import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { SimulatedErrorMiddleware } from "./simulated-error.middleware";

export class SimulatedErrorExpressMiddleware implements MiddlewareExpressPort {
  private readonly middleware: SimulatedErrorMiddleware;

  constructor() {
    this.middleware = new SimulatedErrorMiddleware();
  }

  handle(): RequestHandler {
    return (_request, _response, _next) => {
      this.middleware.evaluate();
    };
  }
}
