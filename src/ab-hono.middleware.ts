import type { MiddlewareHandler } from "hono";
import { type AbConfig, AbMiddleware } from "./ab.middleware";
import type { AbVariant } from "./ab-variant.vo";
import { AbVariantSelector } from "./ab-variant-selector.service";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextAdapterHono } from "./request-context-hono.adapter";

export type AbVariables = { abVariant: AbVariant };

export class AbHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: AbMiddleware;

  constructor(config: AbConfig) {
    const selector = new AbVariantSelector(config.variants);

    this.middleware = new AbMiddleware(selector, config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextAdapterHono(c);
      const variant = await this.middleware.evaluate(context);

      c.set("abVariant", variant);

      return next();
    };
  }
}
