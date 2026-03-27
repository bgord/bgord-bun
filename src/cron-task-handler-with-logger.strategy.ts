import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { CronTask } from "./cron-task.vo";
import type { CronTaskHandlerStrategy } from "./cron-task-handler.strategy";
import type { IdProviderPort } from "./id-provider.port";
import type { LoggerPort } from "./logger.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Logger: LoggerPort; IdProvider: IdProviderPort; Clock: ClockPort };

export class CronTaskHandlerWithLoggerStrategy implements CronTaskHandlerStrategy {
  private readonly base = { component: "infra", operation: "cron_task_handler" };

  constructor(private readonly deps: Dependencies) {}

  handle(task: CronTask): CronTask {
    return {
      ...task,
      handler: async () => {
        const correlationId = this.deps.IdProvider.generate();
        const duration = new Stopwatch(this.deps);

        try {
          this.deps.Logger.info({ message: `${task.label} start`, correlationId, ...this.base });

          await CorrelationStorage.run(correlationId, task.handler);

          this.deps.Logger.info({
            message: `${task.label} success`,
            correlationId,
            metadata: duration.stop(),
            ...this.base,
          });
        } catch (error) {
          this.deps.Logger.error({
            message: `${task.label} error`,
            correlationId,
            error,
            metadata: duration.stop(),
            ...this.base,
          });
        }
      },
    };
  }
}
