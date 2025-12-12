import type { Cron } from "croner";

export type JobNameType = string;
export type MultipleJobsType = Record<JobNameType, Cron>;

export class Jobs {
  static SCHEDULES = { EVERY_MINUTE: "* * * * *", EVERY_HOUR: "0 * * * *" };

  static stopAll(jobs: MultipleJobsType) {
    Object.values(jobs).forEach((job) => job.stop());
  }

  static areAllRunning(jobs: MultipleJobsType): boolean {
    return Object.values(jobs).every((job) => job.isRunning());
  }
}
