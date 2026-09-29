// [BUN DEPENDENCY]
import type { CronSchedulerPort } from "./cron-scheduler.port";
import type { CronTask } from "./cron-task.vo";

export class CronSchedulerAdapter implements CronSchedulerPort {
  private readonly tasks: Array<Bun.CronJob> = [];

  schedule(task: CronTask): void {
    // Bun.cron turns a rejected run into an unhandledRejection, which GracefulShutdown treats as fatal.
    this.tasks.push(Bun.cron(task.cron, () => task.handler().catch(() => {})));
  }

  async verify(): Promise<boolean> {
    return this.tasks.length > 0;
  }
}
