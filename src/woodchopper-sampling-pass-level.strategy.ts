import type { LoggerEntry, LogLevelEnum } from "./logger.port";
import type { WoodchopperSamplingStrategy } from "./woodchopper-sampling.strategy";

export class WoodchopperSamplingPassLevel implements WoodchopperSamplingStrategy {
  constructor(private readonly levels: ReadonlyArray<LogLevelEnum>) {}

  decide(entry: LoggerEntry): boolean {
    return this.levels.includes(entry.level);
  }
}
