import type { LoggerEntry } from "./logger.port";
import type { WoodchopperDispatcher } from "./woodchopper-dispatcher.strategy";

export class WoodchopperDispatcherNoop implements WoodchopperDispatcher {
  dispatch(_entry: LoggerEntry) {
    return true;
  }

  close() {}
}
