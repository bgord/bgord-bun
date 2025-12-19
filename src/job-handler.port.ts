import type { JobNameType } from "./jobs.service";

export interface UnitOfWork {
  label: JobNameType;
  process: () => Promise<void>;
}

export interface JobHandlerPort {
  handle(uow: UnitOfWork): () => Promise<void>;
}
