import * as v from "valibot";
import type { ClockPort } from "./clock.port";
import { CorrelationId } from "./correlation-id.vo";
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
        const correlationId = v.parse(CorrelationId, this.deps.IdProvider.generate());
        const duration = new Stopwatch(this.deps);

        try {
          this.deps.Logger.info({ message: `${task.label} start`, correlationId, ...this.base });

          await CorrelationStorage.run(correlationId, task.handler);
        } catch (error) {
          this.deps.Logger.error({
            message: `${task.label} error`,
            correlationId,
            error,
            metadata: { duration: duration.stop() },
            ...this.base,
          });

          return;
        }

        this.deps.Logger.info({
          message: `${task.label} success`,
          correlationId,
          metadata: { duration: duration.stop() },
          ...this.base,
        });
      },
    };
  }
}
