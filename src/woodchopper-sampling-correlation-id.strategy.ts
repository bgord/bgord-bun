import type * as tools from "@bgord/tools";
import { fnv1a32 } from "./fnv1a32.service";
import type { LoggerEntry } from "./logger.port";
import type { WoodchopperSamplingStrategy } from "./woodchopper-sampling.strategy";

type Config = { everyNth: tools.IntegerPositiveType };

export class WoodchoperSamplingCorrelationId implements WoodchopperSamplingStrategy {
  constructor(private readonly config: Config) {}

  decide(entry: LoggerEntry): boolean {
    if (!entry.correlationId) return false;
    return fnv1a32(entry.correlationId) % this.config.everyNth === 0;
  }
}
