import * as tools from "@bgord/tools";
import type { Cron } from "croner";
import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { IdProviderPort } from "./id-provider.port";
import type { JobNameType } from "./jobs.service";
import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";

type Dependencies = { Logger: LoggerPort; IdProvider: IdProviderPort; Clock: ClockPort };

export interface UnitOfWork {
  label: JobNameType;
  process: () => Promise<void>;
}

export class JobHandler {
  private readonly base = { component: "infra", operation: "job_handler" };

  constructor(private readonly deps: Dependencies) {}

  handle(uow: UnitOfWork) {
    const correlationId = this.deps.IdProvider.generate();

    return async () => {
      const stopwatch = new tools.Stopwatch(this.deps.Clock.now());

      try {
        this.deps.Logger.info({ message: `${uow.label} start`, correlationId, ...this.base });

        await CorrelationStorage.run(correlationId, async () => uow.process());

        this.deps.Logger.info({
          message: `${uow.label} success`,
          correlationId,
          metadata: stopwatch.stop(),
          ...this.base,
        });
      } catch (error) {
        this.deps.Logger.error({
          message: `${uow.label} error`,
          correlationId,
          error: formatError(error),
          metadata: { ...stopwatch.stop() },
          ...this.base,
        });
      }
    };
  }

  protect(cron: Cron) {
    return async () => this.deps.Logger.info({ message: `${cron.name} overrun`, ...this.base });
  }
}
