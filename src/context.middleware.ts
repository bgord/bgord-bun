import { createMiddleware } from "hono/factory";

import { CorrelationIdType } from "./correlation-id";
import { TimeZoneOffsetVariables } from "./time-zone-offset.middleware";

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
