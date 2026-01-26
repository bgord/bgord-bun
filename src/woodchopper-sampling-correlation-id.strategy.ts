import type * as tools from "@bgord/tools";
import { fnv1a32 } from "./fnv1a32.service";
import type { LoggerEntry } from "./logger.port";
import type { WoodchoperSamplingStrategy } from "./woodchopper-sampling.strategy";

export class WoodchoperSamplingCorrelationId implements WoodchoperSamplingStrategy {
  constructor(private readonly n: tools.IntegerPositiveType) {}

  decide(entry: LoggerEntry): boolean {
    if (!entry.correlationId) return false;
    return fnv1a32(entry.correlationId) % this.n === 0;
  }
}
