import * as tools from "@bgord/tools";

export type UptimeResultType = {
  seconds: tools.TimestampType;
  formatted: ReturnType<(typeof tools.DateFormatters)["relative"]>;
};

export class Uptime {
  static get(): UptimeResultType {
    const rounding = new tools.RoundToNearest();
    const uptime = tools.Time.Seconds(rounding.round(process.uptime()));
    const uptimeFormatted = tools.DateFormatters.relative(Date.now() - uptime.ms);

    return { seconds: uptime.seconds, formatted: uptimeFormatted };
  }
}
