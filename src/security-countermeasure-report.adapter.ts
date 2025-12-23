import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { SecurityCountermeasurePort } from "./security-countermeasure.port";

type Dependencies = { Logger: LoggerPort };

export const SecurityCountermeasureReportAdapterError = {
  Executed: "security.countermeasure.report.adapter.executed",
};

export class SecurityCountermeasureReportAdapter implements SecurityCountermeasurePort {
  constructor(private readonly deps: Dependencies) {}

  async execute() {
    this.deps.Logger.info({
      message: "Security countermeasure report",
      component: "security",
      operation: "security_countermeasure_report",
      correlationId: CorrelationStorage.get(),
    });

    throw new Error(SecurityCountermeasureReportAdapterError.Executed);
  }
}
