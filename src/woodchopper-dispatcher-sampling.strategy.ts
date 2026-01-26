import type * as tools from "@bgord/tools";
import type { LoggerEntry } from "./logger.port";
import { LogLevelEnum } from "./logger.port";
import type { WoodchopperDispatcher } from "./woodchopper-dispatcher.strategy";

export class WoodchopperDispatcherSampling implements WoodchopperDispatcher {
  onError?: (error: unknown) => void;

  private counter = 0;

  constructor(
    private readonly inner: WoodchopperDispatcher,
    private readonly everyNth: tools.IntegerPositiveType,
  ) {
    this.inner.onError = (error) => this.onError?.(error);
  }

  dispatch(entry: LoggerEntry): boolean {
    if ([LogLevelEnum.error, LogLevelEnum.warn].includes(entry.level)) return this.inner.dispatch(entry);

    this.counter++;

    if (this.counter % this.everyNth !== 0) return false;
    return this.inner.dispatch(entry);
  }

  close(): void {
    this.inner.close();
  }
}
