import type { CronTask } from "./cron-task.vo";

export interface CronTaskHandlerStrategy {
  handle(task: CronTask): CronTask;
}
