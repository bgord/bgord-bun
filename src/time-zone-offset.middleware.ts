import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";

export type TimeZoneOffsetVariables = { timeZoneOffset: tools.Duration };

export class TimeZoneOffset {
  static TIME_ZONE_OFFSET_HEADER_NAME = "time-zone-offset";

  static attach = createMiddleware(async (c, next) => {
    const timeZoneOffsetMinutes = tools.TimeZoneOffsetValue.parse(
      c.req.header(TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME),
    );

    c.set("timeZoneOffset", tools.Duration.Minutes(timeZoneOffsetMinutes));

    await next();
  });

  static adjustTimestamp(timestamp: tools.TimestampType, offset: tools.Duration): tools.TimestampType {
    return tools.Timestamp.parse(timestamp - offset.ms);
  }

  static adjustDate(timestamp: tools.TimestampType, offset: tools.Duration): Date {
    return new Date(timestamp - offset.ms);
  }
}
