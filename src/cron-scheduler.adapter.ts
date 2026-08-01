import type { CronSchedulerPort } from "./cron-scheduler.port";
import type { CronTask } from "./cron-task.vo";

export class CronSchedulerAdapter implements CronSchedulerPort {
  private readonly tasks: Array<Bun.CronJob> = [];

  schedule(task: CronTask): void {
    this.tasks.push(Bun.cron(task.cron, task.handler));
  }

  async verify(): Promise<boolean> {
    return this.tasks.length > 0;
  }
}
