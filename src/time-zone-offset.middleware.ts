import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { HasRequestHeader } from "./request-context.port";

export class TimeZoneOffsetMiddleware {
  // Matches Date.prototype.getTimezoneOffset(): the negation of the UTC offset,
  // so a client in UTC+2 sends -120 and one in UTC-5 sends 300
  static readonly TIME_ZONE_OFFSET_HEADER_NAME = "time-zone-offset";
  static readonly DEFAULT = tools.Duration.Minutes(0);

  evaluate(context: HasRequestHeader): tools.Duration {
    const header = context.request.header(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME);
    const offset = v.safeParse(tools.TimeZoneOffsetValue, header);

    if (offset.success) return tools.Duration.Minutes(offset.output);
    return TimeZoneOffsetMiddleware.DEFAULT;
  }
}
