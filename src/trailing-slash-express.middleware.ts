import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";
import { TrailingSlashMiddleware } from "./trailing-slash.middleware";

export class TrailingSlashExpressMiddleware implements MiddlewareExpressPort {
  private readonly middleware: TrailingSlashMiddleware;

  constructor() {
    this.middleware = new TrailingSlashMiddleware();
  }

  handle(): RequestHandler {
    return (request, response, next) => {
      const context = new RequestContextExpressAdapter(request);

      const result = this.middleware.evaluate(context);

      if (!result.redirect) return next();

      const url = new URL(context.request.url());
      url.pathname = result.pathname;

      response.redirect(301, url.toString());
    };
  }
}
