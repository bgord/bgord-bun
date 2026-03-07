import type { RequestHandler } from "express";
import { AbMiddleware } from "./ab.middleware";
import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";

declare global {
  namespace Express {
    interface Request {
      abVariant?: AbVariant;
    }
  }
}

export class AbExpressMiddleware implements MiddlewareExpressPort {
  private readonly middleware: AbMiddleware;

  constructor(variants: AbVariants, strategy: AbAssignmentStrategy) {
    this.middleware = new AbMiddleware(variants, strategy);
  }

  handle(): RequestHandler {
    return async (request, _response, next) => {
      const context = new RequestContextExpressAdapter(request);
      const variant = await this.middleware.evaluate(context);

      request.abVariant = variant;

      next();
    };
  }
}
