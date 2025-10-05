import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export type UptimeResultType = {
  duration: tools.Duration;
  formatted: ReturnType<(typeof tools.DateFormatters)["relative"]>;
};

export class Uptime {
  private static readonly rounding = new tools.RoundToNearest();

  static get(clock: ClockPort): UptimeResultType {
    const uptime = tools.Duration.Seconds(Uptime.rounding.round(process.uptime()));
    const uptimeFormatted = tools.DateFormatters.relative(clock.now().Minus(uptime));

    return { duration: uptime, formatted: uptimeFormatted };
  }
}
