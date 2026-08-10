import type { LoggerEntry } from "./logger.port";
import type { WoodchopperFormatterStrategy } from "./woodchopper-formatter.strategy";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodchopperSinkStdout implements WoodchopperSinkStrategy {
  constructor(private readonly formatter: WoodchopperFormatterStrategy) {}

  write(entry: LoggerEntry): void {
    process.stdout.write(this.formatter.format(entry));
  }
}
