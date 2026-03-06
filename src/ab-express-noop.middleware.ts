import type { RequestHandler } from "express";
import { AbMiddleware } from "./ab.middleware";
import { AbAssignmentFixedStrategy } from "./ab-assignment-fixed.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";

export class AbExpressNoopMiddleware implements MiddlewareExpressPort {
  private readonly middleware: AbMiddleware;

  constructor(variants: AbVariants, variant: AbVariant) {
    this.middleware = new AbMiddleware(variants, new AbAssignmentFixedStrategy(variant));
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
