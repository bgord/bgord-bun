import type * as tools from "@bgord/tools";
import * as v from "valibot";
import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { SecurityContext } from "./security-context.vo";
import type { SecurityAction, SecurityCountermeasureStrategy } from "./security-countermeasure.strategy";
import {
  SecurityCountermeasureName,
  type SecurityCountermeasureNameType,
} from "./security-countermeasure-name.vo";

type Dependencies = { Logger: LoggerPort };
type Config = { duration: tools.Duration; after: SecurityAction };

export class SecurityCountermeasureTarpitStrategy implements SecurityCountermeasureStrategy {
  constructor(
    private readonly deps: Dependencies,
    private readonly config: Config,
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

  get name(): SecurityCountermeasureNameType {
    return v.parse(SecurityCountermeasureName, "tarpit");
  }
}
