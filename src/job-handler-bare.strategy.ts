import { CorrelationStorage } from "./correlation-storage.service";
import type { IdProviderPort } from "./id-provider.port";
import type { JobHandlerStrategy, UnitOfWork } from "./job-handler.strategy";

type Dependencies = { IdProvider: IdProviderPort };

export class JobHandlerBareStrategy implements JobHandlerStrategy {
  constructor(private readonly deps: Dependencies) {}

  handle(uow: UnitOfWork): () => Promise<void> {
    const correlationId = this.deps.IdProvider.generate();

    return async () => CorrelationStorage.run(correlationId, async () => uow.process());
  }
}
