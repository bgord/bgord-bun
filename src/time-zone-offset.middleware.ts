import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";

export type TimeZoneOffsetVariables = {
  timeZoneOffset: {
    minutes: tools.TimeResult["minutes"];
    seconds: tools.TimeResult["seconds"];
    miliseconds: tools.TimeResult["ms"];
  };
};

export class TimeZoneOffset {
  static TIME_ZONE_OFFSET_HEADER_NAME = "time-zone-offset";

  static attach = createMiddleware(async (c, next) => {
    const timeZoneOffsetMinutes = tools.TimeZoneOffsetValue.parse(
      c.req.header(TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME),
    );

    const timeZoneOffset = {
      minutes: timeZoneOffsetMinutes,
      seconds: tools.Time.Minutes(timeZoneOffsetMinutes).seconds,
      miliseconds: tools.Time.Minutes(timeZoneOffsetMinutes).ms,
    };

    c.set("timeZoneOffset", timeZoneOffset);

    await next();
  });

  static adjustTimestamp(
    timestamp: tools.TimestampType,
    timeZoneOffsetMs: tools.TimeResult["ms"],
  ): tools.TimestampType {
    return tools.Timestamp.parse(timestamp - timeZoneOffsetMs);
  }

  static adjustDate(timestamp: tools.TimestampType, timeZoneOffsetMs: tools.TimeResult["ms"]): Date {
    return new Date(timestamp - timeZoneOffsetMs);
  }
}
