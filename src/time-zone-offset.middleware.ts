import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";

export type TimeZoneOffsetVariables = { timeZoneOffset: tools.Duration };

export class TimeZoneOffset {
  static readonly TIME_ZONE_OFFSET_HEADER_NAME = "time-zone-offset";

  static readonly DEFAULT = tools.Duration.Minutes(0);

  static attach = createMiddleware(async (c, next) => {
    const header = c.req.header(TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME);
    const offset = tools.TimeZoneOffsetValue.safeParse(header);

    if (offset.success) c.set("timeZoneOffset", tools.Duration.Minutes(offset.data));
    else c.set("timeZoneOffset", TimeZoneOffset.DEFAULT);

    await next();
  });

  static adjustDate(timestamp: tools.Timestamp, offset: tools.Duration): Date {
    return new Date(timestamp.subtract(offset).ms);
  }
}
