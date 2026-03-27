import type { CronTask } from "./cron-task.vo";
import type { JobHandlerStrategy } from "./job-handler.strategy";

export class JobHandlerNoopStrategy implements JobHandlerStrategy {
  handle(task: CronTask): CronTask {
    return { ...task, handler: async () => {} };
  }
}
