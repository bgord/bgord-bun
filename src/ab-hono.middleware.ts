import type { MiddlewareHandler } from "hono";
import { AbMiddleware } from "./ab.middleware";
import type { AbAssignmentStrategy } from "./ab-assignment.strategy";
import type { AbVariant } from "./ab-variant.vo";
import type { AbVariants } from "./ab-variants.vo";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

export type AbVariables = { abVariant: AbVariant | undefined };

export class AbHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: AbMiddleware;

  constructor(variants: AbVariants, strategy: AbAssignmentStrategy) {
    this.middleware = new AbMiddleware(variants, strategy);
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
