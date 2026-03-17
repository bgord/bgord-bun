import type * as tools from "@bgord/tools";
import type { LoggerEntry } from "./logger.port";
import type { WoodchopperSamplingStrategy } from "./woodchopper-sampling.strategy";

type Config = { n: tools.IntegerPositiveType };

export class WoodchopperSamplingEveryNth implements WoodchopperSamplingStrategy {
  constructor(private readonly config: Config) {}

  private counter = 0;

  decide(_entry: LoggerEntry): boolean {
    // Stryker disable all
    this.counter++;
    // Stryker restore all

    if (this.counter % this.config.n !== 0) return false;
    return true;
  }
}
