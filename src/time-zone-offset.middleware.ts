import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";

export type TimeZoneOffsetVariables = { timeZoneOffset: tools.Duration };

export class TimeZoneOffset {
  static TIME_ZONE_OFFSET_HEADER_NAME = "time-zone-offset";

  static attach = createMiddleware(async (c, next) => {
    const offset = tools.TimeZoneOffsetValue.parse(c.req.header(TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME));
    c.set("timeZoneOffset", tools.Duration.Minutes(offset));

    await next();
  });

  static adjustDate(timestamp: tools.Timestamp, offset: tools.Duration): Date {
    return new Date(timestamp.subtract(offset).get());
  }
}
