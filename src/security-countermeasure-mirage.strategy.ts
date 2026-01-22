import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { SecurityContext } from "./security-context.vo";
import type { SecurityAction, SecurityCountermeasureStrategy } from "./security-countermeasure.strategy";
import {
  SecurityCountermeasureName,
  type SecurityCountermeasureNameType,
} from "./security-countermeasure-name.vo";

type Dependencies = { Logger: LoggerPort };

export class SecurityCountermeasureMirageStrategy implements SecurityCountermeasureStrategy {
  constructor(
    private readonly deps: Dependencies,
    private readonly config: { response: { status: number } } = { response: { status: 200 } },
  ) {}

  async execute(context: SecurityContext): Promise<SecurityAction> {
    this.deps.Logger.info({
      message: "Security countermeasure mirage",
      component: "security",
      operation: "security_countermeasure_mirage",
      correlationId: CorrelationStorage.get(),
      metadata: context,
    });

    return { kind: "mirage", ...this.config };
  }

  get name(): SecurityCountermeasureNameType {
    return SecurityCountermeasureName.parse("mirage");
  }
}
