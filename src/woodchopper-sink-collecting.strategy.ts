import type { LoggerEntry } from "./logger.port";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodchopperSinkCollecting implements WoodchopperSinkStrategy {
  readonly entries: Array<LoggerEntry> = [];

  write(entry: LoggerEntry): void {
    this.entries.push(entry);
  }
}
