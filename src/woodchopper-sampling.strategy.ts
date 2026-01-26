import type { LoggerEntry } from "./logger.port";

export interface WoodchoperSamplingStrategy {
  decide(entry: LoggerEntry): boolean;
}
