import type { CronSchedulerPort } from "./cron-scheduler.port";
import type { CronTask } from "./cron-task.vo";
import { DynamicImport } from "./dynamic-import.service";

export const CronSchedulerCronerAdapterError = {
  MissingDependency: "cron.scheduler.croner.adapter.error.missing.dependency",
};

type CronerLibrary = typeof import("croner");

export class CronSchedulerCronerAdapter implements CronSchedulerPort {
  private static readonly importer = DynamicImport.for<CronerLibrary>(
    "croner",
    CronSchedulerCronerAdapterError.MissingDependency,
  );

  private readonly tasks: Array<InstanceType<CronerLibrary["Cron"]>> = [];

  private constructor(private readonly croner: CronerLibrary) {}

  static async build(): Promise<CronSchedulerCronerAdapter> {
    const dependency = await CronSchedulerCronerAdapter.importer.resolve();

    return new CronSchedulerCronerAdapter(dependency);
  }

  schedule(task: CronTask): void {
    this.tasks.push(new this.croner.Cron(task.cron, {}, task.handler));
  }

  async verify(): Promise<boolean> {
    return this.tasks.every((task) => task.isRunning());
  }
}
