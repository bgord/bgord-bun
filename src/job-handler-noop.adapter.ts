import type { JobHandlerPort, UnitOfWork } from "./job-handler.port";

export class JobHandlerNoop implements JobHandlerPort {
  constructor() {}

  handle(_uow: UnitOfWork) {
    return async () => {};
  }
}
