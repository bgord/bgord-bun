import type { LoggerEntry, LogLevelEnum } from "./logger.port";
import type { WoodchoperSamplingStrategy } from "./woodchopper-sampling.strategy";

export class WoodchopperSamplingPasstrough implements WoodchoperSamplingStrategy {
  constructor(private readonly levels: LogLevelEnum[]) {}

  decide(entry: LoggerEntry): boolean {
    return this.levels.includes(entry.level);
  }
}
