import type { RequestHandler } from "express";
import { InFlightRequestsMiddleware } from "./in-flight-requests.middleware";
import type { MiddlewareExpressPort } from "./middleware-express.port";

export class InFlightRequestsExpressMiddleware implements MiddlewareExpressPort {
  private readonly middleware = new InFlightRequestsMiddleware();

  handle(): RequestHandler {
    return async (_request, response, next) => {
      await this.middleware.evaluate();

      const cleanup = () => {
        response.removeListener("finish", cleanup);
        response.removeListener("close", cleanup);
        this.middleware.cleanup();
      };

      response.once("finish", cleanup);
      response.once("close", cleanup);

      next();
    };
  }
}
