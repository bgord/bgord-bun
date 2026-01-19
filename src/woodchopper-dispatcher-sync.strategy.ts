import type { LoggerEntry } from "./logger.port";
import type { WoodchopperDispatcher } from "./woodchopper-dispatcher.strategy";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodchopperDispatcherSync implements WoodchopperDispatcher {
  constructor(private readonly sink: WoodchopperSinkStrategy) {}

  dispatch(entry: LoggerEntry): boolean {
    this.sink.write(entry);
    return true;
  }

  close(): void {}
}
