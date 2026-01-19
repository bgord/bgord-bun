import type { LoggerEntry } from "./logger.port";

export interface WoodchopperSinkStrategy {
  write(entry: LoggerEntry): void;
}
