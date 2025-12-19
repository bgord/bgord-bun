import { CorrelationStorage } from "./correlation-storage.service";
import type { IdProviderPort } from "./id-provider.port";
import type { JobHandlerPort, UnitOfWork } from "./job-handler.port";

type Dependencies = { IdProvider: IdProviderPort };

export class JobHandlerBare implements JobHandlerPort {
  constructor(private readonly deps: Dependencies) {}

  handle(uow: UnitOfWork) {
    const correlationId = this.deps.IdProvider.generate();

    return async () => CorrelationStorage.run(correlationId, async () => uow.process());
  }
}
