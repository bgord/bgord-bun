import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { Hash } from "./hash.vo";
import type { IdempotencyStorePort } from "./idempotency-store.port";
import type { LoggerPort } from "./logger.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { inner: IdempotencyStorePort; Logger: LoggerPort; Clock: ClockPort };

export class IdempotencyStoreWithLoggerAdapter implements IdempotencyStorePort {
  private readonly base = { component: "infra", operation: "idempotency_store" };

  constructor(private readonly deps: Dependencies) {}

  async claim(subject: Hash): Promise<boolean> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Idempotency store claim attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { subject: subject.get() },
        ...this.base,
      });

      const claimed = await this.deps.inner.claim(subject);

      if (!claimed) {
        this.deps.Logger.warn({
          message: "Idempotency store claim duplicate",
          correlationId: CorrelationStorage.get(),
          metadata: { subject: subject.get(), duration: duration.stop() },
          ...this.base,
        });

        return false;
      }

      this.deps.Logger.info({
        message: "Idempotency store claim success",
        correlationId: CorrelationStorage.get(),
        metadata: { subject: subject.get(), duration: duration.stop() },
        ...this.base,
      });

      return true;
    } catch (error) {
      this.deps.Logger.error({
        message: "Idempotency store claim error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { subject: subject.get(), duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }
}
