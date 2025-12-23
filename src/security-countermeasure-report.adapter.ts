import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { SecurityContext } from "./security-context.vo";
import type { SecurityCountermeasurePort } from "./security-countermeasure.port";

type Dependencies = { Logger: LoggerPort };

export const SecurityCountermeasureReportAdapterError = {
  Executed: "security.countermeasure.report.adapter.executed",
};

export class SecurityCountermeasureReportAdapter implements SecurityCountermeasurePort {
  constructor(private readonly deps: Dependencies) {}

  async execute(context: SecurityContext) {
    this.deps.Logger.info({
      message: "Security countermeasure report",
      component: "security",
      operation: "security_countermeasure_report",
      correlationId: CorrelationStorage.get(),
      metadata: context,
    });

    throw new Error(SecurityCountermeasureReportAdapterError.Executed);
  }
}
