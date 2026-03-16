import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { RequestContext } from "./request-context.port";

export class TimeZoneOffsetMiddleware {
  static readonly TIME_ZONE_OFFSET_HEADER_NAME = "time-zone-offset";
  static readonly DEFAULT = tools.Duration.Minutes(0);

  evaluate(context: RequestContext): tools.Duration {
    const header = context.request.header(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME);
    const offset = v.safeParse(tools.TimeZoneOffsetValue, header);

    if (offset.success) return tools.Duration.Minutes(offset.output);
    return TimeZoneOffsetMiddleware.DEFAULT;
  }
}
