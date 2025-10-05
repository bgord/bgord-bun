import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export type UptimeResultType = {
  seconds: tools.Duration["seconds"];
  formatted: ReturnType<(typeof tools.DateFormatters)["relative"]>;
};

export class Uptime {
  static get(clock: ClockPort): UptimeResultType {
    const rounding = new tools.RoundToNearest();

    const uptime = tools.Duration.Seconds(rounding.round(process.uptime()));
    const uptimeFormatted = tools.DateFormatters.relative(clock.now().Minus(uptime));

    return { seconds: tools.Timestamp.parse(uptime.seconds), formatted: uptimeFormatted };
  }
}
