import type { LoggerEntry } from "./logger.port";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodchopperSinkStdout implements WoodchopperSinkStrategy {
  write(entry: LoggerEntry): void {
    process.stdout.write(JSON.stringify(entry) + "\n");
  }
}
