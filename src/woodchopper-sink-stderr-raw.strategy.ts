import type { LoggerEntry } from "./logger.port";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodchopperSinkStderrRaw implements WoodchopperSinkStrategy {
  write(entry: LoggerEntry): void {
    process.stderr.write(JSON.stringify(entry));
  }
}
