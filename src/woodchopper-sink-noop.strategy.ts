import type { WoodchopperSinkStrategy } from "../src/woodchopper-sink.strategy";
import type { LoggerEntry } from "./logger.port";

export class WoodchopperSinkNoop implements WoodchopperSinkStrategy {
  readonly entries: LoggerEntry[] = [];

  write(entry: LoggerEntry): void {
    this.entries.push(entry);
  }
}
