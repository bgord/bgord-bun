import { createMiddleware } from "hono/factory";
import type { CorrelationIdType } from "./correlation-id.vo";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import type { TimeZoneOffsetVariables } from "./time-zone-offset-hono.middleware";

export type ContextType = {
  requestId: CorrelationIdType;
  timeZoneOffset: TimeZoneOffsetVariables["timeZoneOffset"];
};

export type ContextVariables = {
  context: ContextType;
  requestId: CorrelationIdType;
} & TimeZoneOffsetVariables;

export class ContextHonoMiddleware implements MiddlewareHonoPort {
  handle() {
    return createMiddleware(async (context, next) => {
      context.set("context", {
        requestId: context.get("requestId"),
        timeZoneOffset: context.get("timeZoneOffset"),
      });

      await next();
    });
  }
}
