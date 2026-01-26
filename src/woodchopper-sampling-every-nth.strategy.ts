import type * as tools from "@bgord/tools";
import type { LoggerEntry } from "./logger.port";
import { LogLevelEnum } from "./logger.port";
import type { WoodchoperSamplingStrategy } from "./woodchopper-sampling.strategy";

export class WoodchopperSamplingEveryNth implements WoodchoperSamplingStrategy {
  constructor(private readonly n: tools.IntegerPositiveType) {}

  private counter = 0;

  decide(entry: LoggerEntry): boolean {
    if ([LogLevelEnum.error, LogLevelEnum.warn].includes(entry.level)) return true;

    // Stryker disable all
    this.counter++;
    // Stryker restore all

    if (this.counter % this.n !== 0) return false;
    return true;
  }
}
