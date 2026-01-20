import type { WoodchopperSinkStrategy } from "../src/woodchopper-sink.strategy";
import type { LoggerEntry } from "./logger.port";

export class WoodchopperSinkError implements WoodchopperSinkStrategy {
  write(_entry: LoggerEntry): void {
    throw new Error("woodchopper.sink.error");
  }
}
