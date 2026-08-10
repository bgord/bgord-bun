import type { LoggerEntry } from "./logger.port";
import type { WoodchopperFormatterStrategy } from "./woodchopper-formatter.strategy";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodchopperSinkStderr implements WoodchopperSinkStrategy {
  constructor(private readonly formatter: WoodchopperFormatterStrategy) {}

  write(entry: LoggerEntry): void {
    process.stderr.write(this.formatter.format(entry));
  }

  close(): void {}
}
