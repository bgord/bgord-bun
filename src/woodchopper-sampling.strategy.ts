import type { LoggerEntry } from "./logger.port";

export interface WoodchopperSamplingStrategy {
  decide(entry: LoggerEntry): boolean;
}
