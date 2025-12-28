import type { JobHandlerStrategy, UnitOfWork } from "./job-handler.strategy";

export class JobHandlerNoopStrategy implements JobHandlerStrategy {
  constructor() {}

  handle(_uow: UnitOfWork) {
    return async () => {};
  }
}
