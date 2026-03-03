import type * as tools from "@bgord/tools";
import type { MiddlewareHandler } from "hono";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextAdapterHono } from "./request-context-hono.adapter";
import { TimeZoneOffsetMiddleware } from "./time-zone-offset.middleware";

export type TimeZoneOffsetVariables = { timeZoneOffset: tools.Duration };

export class TimeZoneOffsetHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: TimeZoneOffsetMiddleware;

  constructor() {
    this.middleware = new TimeZoneOffsetMiddleware();
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextAdapterHono(c);
      const offset = this.middleware.evaluate(context);

      c.set("timeZoneOffset", offset);

      await next();
    };
  }
}
