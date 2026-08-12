import * as v from "valibot";
import { CorrelationId } from "./correlation-id.vo";
import { CorrelationStorage } from "./correlation-storage.service";
import type { CronTask } from "./cron-task.vo";
import type { CronTaskHandlerStrategy } from "./cron-task-handler.strategy";
import type { IdProviderPort } from "./id-provider.port";

type Dependencies = { IdProvider: IdProviderPort };

export class CronTaskHandlerBareStrategy implements CronTaskHandlerStrategy {
  constructor(private readonly deps: Dependencies) {}

  handle(task: CronTask): CronTask {
    const correlationId = v.parse(CorrelationId, this.deps.IdProvider.generate());

    return {
      ...task,
      handler: async () => CorrelationStorage.run(correlationId, task.handler),
    };
  }
}
