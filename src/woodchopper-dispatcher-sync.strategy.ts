import type { LoggerEntry } from "./logger.port";
import type { WoodchopperDispatcher } from "./woodchopper-dispatcher.strategy";
import type { WoodchopperSinkStrategy } from "./woodchopper-sink.strategy";

export class WoodchopperDispatcherSync implements WoodchopperDispatcher {
  onError?: (error: unknown) => void;

  constructor(private readonly sink: WoodchopperSinkStrategy) {}

  dispatch(entry: LoggerEntry): boolean {
    try {
      this.sink.write(entry);
      return true;
    } catch (error) {
      this.onError?.(error);
      return false;
    }
  }

  close(): void {}
}
