import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { z } from "zod/v4";

export const TimeZoneOffsetHeaderValue = z
  .string()
  .trim()
  .or(z.undefined())
  .transform((value) => Number(value))
  .transform((value) => (Number.isNaN(value) ? 0 : value));
export type TimeZoneOffsetType = z.infer<typeof TimeZoneOffsetHeaderValue>;

export const TimeZoneOffsetValue = z.number().int();
export type TimeZoneOffsetValueType = z.infer<typeof TimeZoneOffsetValue>;

export type TimeZoneOffsetVariables = {
  timeZoneOffset: {
    minutes: TimeZoneOffsetValueType;
    seconds: TimeZoneOffsetValueType;
    miliseconds: TimeZoneOffsetValueType;
  };
};

export class TimeZoneOffset {
  static TIME_ZONE_OFFSET_HEADER_NAME = "time-zone-offset";

  static attach = createMiddleware(async (c, next) => {
    const timeZoneOffsetMinutes = TimeZoneOffsetHeaderValue.parse(
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
    timeZoneOffsetMs: TimeZoneOffsetValueType,
  ): tools.TimestampType {
    return timestamp - timeZoneOffsetMs;
  }

  static adjustDate(timestamp: tools.TimestampType, timeZoneOffsetMs: TimeZoneOffsetValueType): Date {
    return new Date(timestamp - timeZoneOffsetMs);
  }
}
