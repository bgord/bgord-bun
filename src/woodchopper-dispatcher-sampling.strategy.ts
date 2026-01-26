import type { LoggerEntry } from "./logger.port";
import type { WoodchopperDispatcher } from "./woodchopper-dispatcher.strategy";
import type { WoodchoperSamplingStrategy } from "./woodchopper-sampling.strategy";

export class WoodchopperDispatcherSampling implements WoodchopperDispatcher {
  onError?: (error: unknown) => void;

  constructor(
    private readonly inner: WoodchopperDispatcher,
    private readonly strategy: WoodchoperSamplingStrategy,
  ) {
    this.inner.onError = (error) => this.onError?.(error);
  }

  dispatch(entry: LoggerEntry): boolean {
    return this.strategy.decide(entry) ? this.inner.dispatch(entry) : false;
  }

  close(): void {
    this.inner.close();
  }
}
