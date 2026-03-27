import type { CronTask } from "./cron-task.vo";

export interface CronSchedulerPort {
  schedule(task: CronTask): void;

  verify(): Promise<boolean>;
}
