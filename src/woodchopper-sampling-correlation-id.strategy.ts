import type * as tools from "@bgord/tools";
import { fnv1a32 } from "./fnv1a32.service";
import type { LoggerEntry } from "./logger.port";
import type { WoodchoperSamplingStrategy } from "./woodchopper-sampling.strategy";

type WoodchoperSamplingCorrelationIdConfigType = { everyNth: tools.IntegerPositiveType };

export class WoodchoperSamplingCorrelationId implements WoodchoperSamplingStrategy {
  constructor(private readonly config: WoodchoperSamplingCorrelationIdConfigType) {}

  decide(entry: LoggerEntry): boolean {
    // Stryker disable all
    if (!entry.correlationId) return false;
    return fnv1a32(entry.correlationId) % this.config.everyNth === 0;
    // Stryker restore all
  }
}
