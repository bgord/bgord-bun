import type { LogCoreType, LogErrorType, LogHttpType, LogWarnType } from "./logger.port";

export type SinkEntry = LogCoreType | LogHttpType | LogWarnType | LogErrorType;

export interface WoodchopperSinkStrategy {
  write(entry: SinkEntry): void;
}
