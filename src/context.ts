import * as bg from "@bgord/node";
import { createMiddleware } from "hono/factory";

export type TimeZoneOffsetVariables = {
  timeZoneOffset: {
    minutes: bg.Schema.TimeZoneOffsetValueType;
    seconds: bg.Schema.TimeZoneOffsetValueType;
    miliseconds: bg.Schema.TimeZoneOffsetValueType;
  };
};

export type ContextVariables = {
  context: bg.ContextType;
  requestId: string;
} & TimeZoneOffsetVariables;

export class Context {
  static attach = createMiddleware(async (c, next) => {
    c.set("context", {
      requestId: c.get("requestId") as bg.Schema.CorrelationIdType,
      timeZoneOffset: c.get("timeZoneOffset"),
    });

    await next();
  });
}
