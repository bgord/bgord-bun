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
  static attach = createMiddleware(async (context, next) => {
    context.set("context", {
      requestId: context.get("requestId"),
      timeZoneOffset: context.get("timeZoneOffset"),
    });

    await next();
  });
}
