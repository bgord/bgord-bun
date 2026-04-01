import type { LoggerEntry } from "./logger.port";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodchopperSinkNoop implements WoodchopperSinkStrategy {
  write(_entry: LoggerEntry): void {}
}
