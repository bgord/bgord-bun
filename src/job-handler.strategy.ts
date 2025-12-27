import type { JobNameType } from "./jobs.service";

export interface UnitOfWork {
  label: JobNameType;
  process: () => Promise<void>;
}

export interface JobHandlerStrategy {
  handle(uow: UnitOfWork): () => Promise<void>;
}
