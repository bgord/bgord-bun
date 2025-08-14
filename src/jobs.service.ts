import * as tools from "@bgord/tools";
import { Cron } from "croner";
import { CorrelationId } from "./correlation-id.vo";
import { CorrelationStorage } from "./correlation-storage.service";
import { Logger } from "./logger.service";

export type JobNameType = string;

export type MultipleJobsType = Record<JobNameType, Cron>;

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
    // biome-ignore lint: lint/suspicious/useIterableCallbackReturn
    Object.values(jobs).forEach((job) => job.stop());
  }

  static areAllRunning(jobs: MultipleJobsType): boolean {
    return Object.values(jobs).every((job) => job.isRunning());
  }
}

export type JobProcessorType = {
  cron: string;
  label: JobNameType;
  process: () => Promise<void>;
};

export class JobHandler {
  constructor(private readonly logger: Logger) {}

  handle(jobProcessor: JobProcessorType) {
    const correlationId = CorrelationId.parse(crypto.randomUUID());

    // biome-ignore lint: lint/complexity/noUselessThisAlias
    const that = this;

    return async () => {
      const stopwatch = new tools.Stopwatch();

      try {
        that.logger.info({
          message: `${jobProcessor.label} start`,
          operation: "job_start",
          correlationId,
        });

        await CorrelationStorage.run(correlationId, jobProcessor.process);

        that.logger.info({
          message: `${jobProcessor.label} success`,
          operation: "job_success",
          correlationId,
          metadata: stopwatch.stop(),
        });
      } catch (error) {
        that.logger.error({
          message: `${jobProcessor.label} error`,
          operation: "job_error",
          correlationId,
          metadata: {
            ...that.logger.formatError(error),
            ...stopwatch.stop(),
          },
        });
      }
    };
  }

  protect(cron: Cron) {
    // biome-ignore lint: lint/complexity/noUselessThisAlias
    const that = this;

    return async () => {
      that.logger.info({
        message: `${cron.name} overrun`,
        operation: "job_overrun",
      });
    };
  }
}
