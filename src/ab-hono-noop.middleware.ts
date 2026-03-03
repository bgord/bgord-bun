import type { MiddlewareHandler } from "hono";
import { AbMiddleware } from "./ab.middleware";
import { AbAssignmentFixedStrategy } from "./ab-assignment-fixed.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

export class AbHonoNoopMiddleware implements MiddlewareHonoPort {
  private readonly middleware: AbMiddleware;

  constructor(variants: AbVariants, variant: AbVariant) {
    this.middleware = new AbMiddleware(variants, new AbAssignmentFixedStrategy(variant));
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);
      const variant = await this.middleware.evaluate(context);

      c.set("abVariant", variant);

      return next();
    };
  }
}
