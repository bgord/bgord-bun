import type * as tools from "@bgord/tools";
import type { RequestHandler } from "express";
import { ETagExtractorMiddleware } from "./etag-extractor.middleware";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";

declare global {
  namespace Express {
    interface Request {
      ETag?: tools.ETag | null;
    }
  }
}

export class ETagExtractorExpressMiddleware implements MiddlewareExpressPort {
  private readonly middleware: ETagExtractorMiddleware;

  constructor() {
    this.middleware = new ETagExtractorMiddleware();
  }

  handle(): RequestHandler {
    return (request, _response, next) => {
      const context = new RequestContextExpressAdapter(request);
      const etag = this.middleware.evaluate(context);

      request.ETag = etag;

      next();
    };
  }
}
