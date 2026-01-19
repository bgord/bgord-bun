import type { LoggerEntry } from "./logger.port";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodChopperSinkStdout implements WoodchopperSinkStrategy {
  write(entry: LoggerEntry): void {
    process.stdout.write(JSON.stringify(entry));
  }
}
