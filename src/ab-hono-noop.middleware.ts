import type { MiddlewareHandler } from "hono";
import type { AbVariables } from "./ab-hono.middleware";
import type { AbVariant } from "./ab-variant.vo";
import type { MiddlewareHonoPort } from "./middleware-hono.port";

export class AbHonoNoopMiddleware implements MiddlewareHonoPort {
  constructor(private readonly variant: AbVariant) {}

  handle(): MiddlewareHandler<{ Variables: AbVariables }> {
    return async (c, next) => {
      c.set("abVariant", this.variant);

      return next();
    };
  }
}
