import type * as tools from "@bgord/tools";
import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";
import { TimeZoneOffsetMiddleware } from "./time-zone-offset.middleware";

declare global {
  namespace Express {
    interface Request {
      timeZoneOffset?: tools.Duration;
    }
  }
}

export class TimeZoneOffsetExpressMiddleware implements MiddlewareExpressPort {
  private readonly middleware: TimeZoneOffsetMiddleware;

  constructor() {
    this.middleware = new TimeZoneOffsetMiddleware();
  }

  handle(): RequestHandler {
    return (request, _response, next) => {
      const context = new RequestContextExpressAdapter(request);
      const offset = this.middleware.evaluate(context);

      request.timeZoneOffset = offset;

      next();
    };
  }
}
