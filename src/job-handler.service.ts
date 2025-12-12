import * as tools from "@bgord/tools";
import type { Cron } from "croner";
import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { IdProviderPort } from "./id-provider.port";
import type { JobNameType } from "./jobs.service";
import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";

type Dependencies = { Logger: LoggerPort; IdProvider: IdProviderPort; Clock: ClockPort };

export type JobProcessorType = { cron: string; label: JobNameType; process: () => Promise<void> };

export class JobHandler {
  private readonly base = { component: "infra", operation: "job_handler" };

  constructor(private readonly deps: Dependencies) {}

  handle(jobProcessor: JobProcessorType) {
    const correlationId = this.deps.IdProvider.generate();

    // biome-ignore lint: lint/complexity/noUselessThisAlias
    const that = this;

    return async () => {
      const stopwatch = new tools.Stopwatch(this.deps.Clock.now());

      try {
        that.deps.Logger.info({ message: `${jobProcessor.label} start`, correlationId, ...this.base });

        await CorrelationStorage.run(correlationId, jobProcessor.process);

        that.deps.Logger.info({
          message: `${jobProcessor.label} success`,
          correlationId,
          metadata: stopwatch.stop(),
          ...this.base,
        });
      } catch (error) {
        that.deps.Logger.error({
          message: `${jobProcessor.label} error`,
          correlationId,
          error: formatError(error),
          metadata: { ...stopwatch.stop() },
          ...this.base,
        });
      }
    };
  }

  protect(cron: Cron) {
    // biome-ignore lint: lint/complexity/noUselessThisAlias
    const that = this;

    return async () => that.deps.Logger.info({ message: `${cron.name} overrun`, ...this.base });
  }
}
