import type { CronSchedulerPort } from "./cron-scheduler.port";
import type { CronTask } from "./cron-task.vo";
import type { LoggerPort } from "./logger.port";

type Dependencies = { inner: CronSchedulerPort; Logger: LoggerPort };

export class CronSchedulerWithLoggerAdapter implements CronSchedulerPort {
  constructor(private readonly deps: Dependencies) {}

  schedule(task: CronTask): void {
    this.deps.Logger.info({
      message: "Cron scheduler schedule",
      component: "infra",
      operation: "cron_scheduler_schedule",
      metadata: { label: task.label, cron: task.cron },
    });

    this.deps.inner.schedule(task);
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
