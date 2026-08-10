import type { LoggerEntry } from "./logger.port";

export interface WoodchopperSinkStrategy {
  write(entry: LoggerEntry): void;

  /** Buffering sinks flush what is left here. Dispatchers forward their own close to it. */
  close?(): void;
}
