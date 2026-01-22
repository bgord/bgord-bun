import type { JobHandlerStrategy, UnitOfWork } from "./job-handler.strategy";

export class JobHandlerNoopStrategy implements JobHandlerStrategy {
  handle(_uow: UnitOfWork): () => Promise<void> {
    return async () => {};
  }
}
