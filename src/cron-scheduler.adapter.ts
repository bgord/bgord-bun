import type { CronSchedulerPort } from "./cron-scheduler.port";
import type { CronTask } from "./cron-task.vo";

export class CronSchedulerAdapter implements CronSchedulerPort {
  schedule(task: CronTask): void {
    Bun.cron(task.cron, task.handler);
  }

  async verify(): Promise<boolean> {
    return true;
  }
}
