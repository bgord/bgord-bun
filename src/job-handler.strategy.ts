import type { CronTask } from "./cron-task.vo";

export interface JobHandlerStrategy {
  handle(task: CronTask): CronTask;
}
