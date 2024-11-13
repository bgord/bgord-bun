import * as bg from "@bgord/node";
import { createMiddleware } from "hono/factory";

export type TimeZoneOffsetVariables = {
  timeZoneOffset: {
    minutes: bg.Schema.TimeZoneOffsetValueType;
    seconds: bg.Schema.TimeZoneOffsetValueType;
    miliseconds: bg.Schema.TimeZoneOffsetValueType;
  };
};

export class TimeZoneOffset {
  static TIME_ZONE_OFFSET_HEADER_NAME = "time-zone-offset";

  static attach = createMiddleware(async (c, next) => {
    const timeZoneOffsetMinutes = bg.Schema.TimeZoneOffsetHeaderValue.parse(
      c.req.header(TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME),
    );

    const timeZoneOffset = {
      minutes: timeZoneOffsetMinutes,
      seconds: bg.Time.Minutes(timeZoneOffsetMinutes).seconds,
      miliseconds: bg.Time.Minutes(timeZoneOffsetMinutes).ms,
    };

    c.set("timeZoneOffset", timeZoneOffset);

    await next();
  });

  static adjustTimestamp(
    timestamp: bg.Schema.TimestampType,
    timeZoneOffsetMs: bg.Schema.TimeZoneOffsetValueType,
  ): bg.Schema.TimestampType {
    return timestamp - timeZoneOffsetMs;
  }

  static adjustDate(
    timestamp: bg.Schema.TimestampType,
    timeZoneOffsetMs: bg.Schema.TimeZoneOffsetValueType,
  ): Date {
    return new Date(timestamp - timeZoneOffsetMs);
  }
}
