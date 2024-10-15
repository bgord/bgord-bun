import * as bg from "@bgord/node";
import { createMiddleware } from "hono/factory";

import { TimeZoneOffsetVariables } from "./time-zone-offset";

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
