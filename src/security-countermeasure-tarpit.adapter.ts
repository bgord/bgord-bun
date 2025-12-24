import type * as tools from "@bgord/tools";
import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { SecurityContext } from "./security-context.vo";
import type { SecurityAction, SecurityCountermeasurePort } from "./security-countermeasure.port";

type Dependencies = { Logger: LoggerPort };

export class SecurityCountermeasureTarpitAdapter implements SecurityCountermeasurePort {
  constructor(
    private readonly deps: Dependencies,
    private readonly config: { duration: tools.Duration; after: SecurityAction },
  ) {}

  async execute(context: SecurityContext): Promise<SecurityAction> {
    this.deps.Logger.info({
      message: "Security countermeasure tarpit",
      component: "security",
      operation: "security_countermeasure_tarpit",
      correlationId: CorrelationStorage.get(),
      metadata: context,
    });

    return { kind: "delay", ...this.config };
  }

  get name() {
    return "tarpit";
  }
}
