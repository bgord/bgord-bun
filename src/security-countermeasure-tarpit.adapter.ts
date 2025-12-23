import type * as tools from "@bgord/tools";
import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { SecurityContext } from "./security-context.vo";
import type { SecurityCountermeasurePort } from "./security-countermeasure.port";

type Dependencies = { Logger: LoggerPort };

export const SecurityCountermeasureTarpitAdapterError = {
  Executed: "security.countermeasure.tarpit.adapter.executed",
};

export class SecurityCountermeasureTarpitAdapter implements SecurityCountermeasurePort {
  constructor(
    private readonly config: { delay: tools.Duration },
    private readonly deps: Dependencies,
  ) {}

  async execute(context: SecurityContext) {
    this.deps.Logger.info({
      message: "Security countermeasure tarpit",
      component: "security",
      operation: "security_countermeasure_tarpit",
      correlationId: CorrelationStorage.get(),
      metadata: context,
    });

    await Bun.sleep(this.config.delay.ms);

    throw new Error(SecurityCountermeasureTarpitAdapterError.Executed);
  }
}
