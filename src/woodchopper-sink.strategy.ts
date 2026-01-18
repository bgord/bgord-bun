import type { LogCoreType, LogErrorType, LogHttpType, LogWarnType } from "./logger.port";

export type WoodchopperSinkEntry = LogCoreType | LogHttpType | LogWarnType | LogErrorType;

export interface WoodchopperSinkStrategy {
  write(entry: WoodchopperSinkEntry): void;
}
