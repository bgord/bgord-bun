import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { SecurityContext } from "./security-context.vo";
import type { SecurityAction, SecurityCountermeasurePort } from "./security-countermeasure.port";

type Dependencies = { Logger: LoggerPort };

export class SecurityCountermeasureReportAdapter implements SecurityCountermeasurePort {
  constructor(private readonly deps: Dependencies) {}

  async execute(context: SecurityContext): Promise<SecurityAction> {
    this.deps.Logger.info({
      message: "Security countermeasure report",
      component: "security",
      operation: "security_countermeasure_report",
      correlationId: CorrelationStorage.get(),
      metadata: context,
    });

    return { kind: "allow" };
  }
}
