import { CorrelationStorage } from "./correlation-storage.service";
import type { CronTask } from "./cron-task.vo";
import type { CronTaskHandlerStrategy } from "./cron-task-handler.strategy";
import type { IdProviderPort } from "./id-provider.port";

type Dependencies = { IdProvider: IdProviderPort };

export class CronTaskHandlerBareStrategy implements CronTaskHandlerStrategy {
  constructor(private readonly deps: Dependencies) {}

  handle(task: CronTask): CronTask {
    return {
      ...task,
      handler: async () => CorrelationStorage.run(this.deps.IdProvider.generate(), task.handler),
    };
  }
}
