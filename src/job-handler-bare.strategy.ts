import { CorrelationStorage } from "./correlation-storage.service";
import type { CronTask } from "./cron-task.vo";
import type { IdProviderPort } from "./id-provider.port";
import type { JobHandlerStrategy } from "./job-handler.strategy";

type Dependencies = { IdProvider: IdProviderPort };

export class JobHandlerBareStrategy implements JobHandlerStrategy {
  constructor(private readonly deps: Dependencies) {}

  handle(task: CronTask): CronTask {
    return {
      ...task,
      handler: async () => {
        await CorrelationStorage.run(this.deps.IdProvider.generate(), task.handler);
      },
    };
  }
}
