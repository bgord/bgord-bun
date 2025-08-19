import { createMiddleware } from "hono/factory";
import type { CorrelationIdType } from "./correlation-id.vo";
import type { TimeZoneOffsetVariables } from "./time-zone-offset.middleware";

export type ContextType = {
  requestId: CorrelationIdType;
  timeZoneOffset: TimeZoneOffsetVariables["timeZoneOffset"];
};

export type ContextVariables = {
  context: ContextType;
  requestId: CorrelationIdType;
} & TimeZoneOffsetVariables;

export class Context {
  static attach = createMiddleware(async (c, next) => {
    c.set("context", {
      requestId: c.get("requestId") as CorrelationIdType,
      timeZoneOffset: c.get("timeZoneOffset"),
    });

    await next();
  });
}
