import type { CronTask } from "./cron-task.vo";
import type { CronTaskHandlerStrategy } from "./cron-task-handler.strategy";

export class CronTaskHandlerNoopStrategy implements CronTaskHandlerStrategy {
  handle(task: CronTask): CronTask {
    return { ...task, handler: async () => {} };
  }
}
