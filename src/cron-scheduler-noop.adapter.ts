import type { CronSchedulerPort } from "./cron-scheduler.port";
import type { CronTask } from "./cron-task.vo";

export class CronSchedulerNoopAdapter implements CronSchedulerPort {
  schedule(_task: CronTask): void {}

  async verify(): Promise<boolean> {
    return true;
  }
}
