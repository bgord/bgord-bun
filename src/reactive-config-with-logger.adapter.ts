import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { ReactiveConfigPort } from "./reactive-config.port";
import { Stopwatch } from "./stopwatch.service";

export type ReactiveConfigWithLoggerAdapterDependencies<T extends object> = {
  inner: ReactiveConfigPort<T>;
  Logger: LoggerPort;
  Clock: ClockPort;
};

export class ReactiveConfigWithLoggerAdapter<T extends object> implements ReactiveConfigPort<T> {
  private readonly base = { component: "infra", operation: "reactive_config" };

  constructor(private readonly deps: ReactiveConfigWithLoggerAdapterDependencies<T>) {}

  async get(): Promise<Readonly<T>> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Reactive config read attempt",
        correlationId: CorrelationStorage.get(),
        ...this.base,
      });

      const result = await this.deps.inner.get();

      this.deps.Logger.info({
        message: "Reactive config read success",
        correlationId: CorrelationStorage.get(),
        metadata: { duration: duration.stop() },
        ...this.base,
      });

      return result;
    } catch (error) {
      this.deps.Logger.error({
        message: "Reactive config read error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }
}
