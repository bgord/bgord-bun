import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { SecurityContext } from "./security-context.types";
import type { SecurityCountermeasurePort } from "./security-countermeasure.port";

type Dependencies = { Logger: LoggerPort };

export const SecurityCountermeasureMirageAdapterError = {
  Executed: "security.countermeasure.mirage.adapter.executed",
};

export class SecurityCountermeasureMirageAdapter implements SecurityCountermeasurePort {
  constructor(private readonly deps: Dependencies) {}

  async execute(context: SecurityContext) {
    this.deps.Logger.info({
      message: "Security countermeasure mirage",
      component: "security",
      operation: "security_countermeasure_mirage",
      correlationId: CorrelationStorage.get(),
      metadata: context,
    });

    throw new Error(SecurityCountermeasureMirageAdapterError.Executed);
  }
}
