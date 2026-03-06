import type * as tools from "@bgord/tools";
import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";
import { WeakETagExtractorMiddleware } from "./weak-etag-extractor.middleware";

declare global {
  namespace Express {
    interface Request {
      WeakETag?: tools.WeakETag | null;
    }
  }
}

export class WeakETagExtractorExpressMiddleware implements MiddlewareExpressPort {
  private readonly middleware: WeakETagExtractorMiddleware;

  constructor() {
    this.middleware = new WeakETagExtractorMiddleware();
  }

  handle(): RequestHandler {
    return (request, _response, next) => {
      const context = new RequestContextExpressAdapter(request);
      const weakETag = this.middleware.evaluate(context);

      request.WeakETag = weakETag;

      next();
    };
  }
}
