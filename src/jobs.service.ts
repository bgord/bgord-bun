import * as tools from "@bgord/tools";
import type { Cron } from "croner";
import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { IdProviderPort } from "./id-provider.port";
import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";

export type JobNameType = string;
export type MultipleJobsType = Record<JobNameType, Cron>;
export type JobProcessorType = { cron: string; label: JobNameType; process: () => Promise<void> };
type Dependencies = { Logger: LoggerPort; IdProvider: IdProviderPort; Clock: ClockPort };

export enum UTC_DAY_OF_THE_WEEK {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 0,
}

export class Jobs {
  static SCHEDULES = {
    EVERY_MINUTE: "* * * * *",
    EVERY_HOUR: "0 * * * *",
    DAY_TIME: (day: UTC_DAY_OF_THE_WEEK, UTCHour: tools.Hour) => `0 ${UTCHour.get().raw} * * ${day}`,
  };

  static stopAll(jobs: MultipleJobsType) {
    Object.values(jobs).forEach((job) => job.stop());
  }

  static areAllRunning(jobs: MultipleJobsType): boolean {
    return Object.values(jobs).every((job) => job.isRunning());
  }
}

export class JobHandler {
  constructor(private readonly deps: Dependencies) {}

  handle(jobProcessor: JobProcessorType) {
    const correlationId = this.deps.IdProvider.generate();

    // biome-ignore lint: lint/complexity/noUselessThisAlias
    const that = this;

    return async () => {
      const stopwatch = new tools.Stopwatch(this.deps.Clock.nowMs());

      try {
        that.deps.Logger.info({
          message: `${jobProcessor.label} start`,
          component: "infra",
          operation: "job_start",
          correlationId,
        });

        await CorrelationStorage.run(correlationId, jobProcessor.process);

        that.deps.Logger.info({
          message: `${jobProcessor.label} success`,
          component: "infra",
          operation: "job_success",
          correlationId,
          metadata: stopwatch.stop(),
        });
      } catch (error) {
        that.deps.Logger.error({
          message: `${jobProcessor.label} error`,
          component: "infra",
          operation: "job_error",
          correlationId,
          error: formatError(error),
          metadata: { ...stopwatch.stop() },
        });
      }
    };
  }

  protect(cron: Cron) {
    // biome-ignore lint: lint/complexity/noUselessThisAlias
    const that = this;

    return async () =>
      that.deps.Logger.info({
        message: `${cron.name} overrun`,
        component: "infra",
        operation: "job_overrun",
      });
  }
}
