import type { LoggerEntry } from "./logger.port";

export interface WoodchopperDispatcher {
  dispatch(entry: LoggerEntry): boolean;
  close(): void;
}
