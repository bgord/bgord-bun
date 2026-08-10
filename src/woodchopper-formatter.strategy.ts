import type { LoggerEntry } from "./logger.port";

export interface WoodchopperFormatterStrategy {
  format(entry: LoggerEntry): string;
}
