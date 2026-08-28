import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { CronSchedulerPort } from "./cron-scheduler.port";
import type { CronTask } from "./cron-task.vo";
import type { LoggerPort } from "./logger.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { inner: CronSchedulerPort; Logger: LoggerPort; Clock: ClockPort };

export class CronSchedulerWithLoggerAdapter implements CronSchedulerPort {
  private readonly base = { component: "infra", operation: "cron_scheduler" };

  constructor(private readonly deps: Dependencies) {}

  schedule(task: CronTask): void {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Cron scheduler schedule attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { label: task.label, cron: task.cron },
        ...this.base,
      });

      this.deps.inner.schedule(task);

      this.deps.Logger.info({
        message: "Cron scheduler schedule success",
        correlationId: CorrelationStorage.get(),
        metadata: { label: task.label, cron: task.cron, duration: duration.stop() },
        ...this.base,
      });
    } catch (error) {
      this.deps.Logger.error({
        message: "Cron scheduler schedule error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { label: task.label, cron: task.cron, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
