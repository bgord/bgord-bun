import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { IdProviderPort } from "./id-provider.port";
import type { JobHandlerStrategy, UnitOfWork } from "./job-handler.strategy";
import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Logger: LoggerPort; IdProvider: IdProviderPort; Clock: ClockPort };

export class JobHandlerWithLoggerStrategy implements JobHandlerStrategy {
  private readonly base = { component: "infra", operation: "job_handler" };

  constructor(private readonly deps: Dependencies) {}

  handle(uow: UnitOfWork) {
    const correlationId = this.deps.IdProvider.generate();

    return async () => {
      const stopwatch = new Stopwatch(this.deps);

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
          metadata: stopwatch.stop(),
          ...this.base,
        });
      }
    };
  }
}
