import type { WoodchopperSinkStrategy } from "../src/woodchopper-sink.strategy";
import type { LoggerEntry } from "./logger.port";

export class WoodchopperSinkNoop implements WoodchopperSinkStrategy {
  write(_entry: LoggerEntry): void {}
}
