import type * as tools from "@bgord/tools";
import type { LoggerEntry } from "./logger.port";
import type { WoodchoperSamplingStrategy } from "./woodchopper-sampling.strategy";

export type WoodchopperSamplingEveryNthConfigType = { n: tools.IntegerPositiveType };

export class WoodchopperSamplingEveryNth implements WoodchoperSamplingStrategy {
  constructor(private readonly config: WoodchopperSamplingEveryNthConfigType) {}

  private counter = 0;

  decide(_entry: LoggerEntry): boolean {
    // Stryker disable all
    this.counter++;
    // Stryker restore all

    if (this.counter % this.config.n !== 0) return false;
    return true;
  }
}
