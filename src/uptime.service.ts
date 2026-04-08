import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export type UptimeResultType = { duration: tools.Duration; formatted: string };

export class Uptime {
  private static readonly rounding = new tools.RoundingToNearestStrategy();

  static get(Clock: ClockPort): UptimeResultType {
    const now = Clock.now();
    const duration = tools.Duration.Seconds(Uptime.rounding.round(process.uptime()));

    return { duration, formatted: tools.DateFormatter.relative(now, now.subtract(duration)) };
  }
}
