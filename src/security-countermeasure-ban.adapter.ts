import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import { createEventEnvelope } from "./event-envelope";
import type { EventStoreLike } from "./event-store-like.types";
import type { IdProviderPort } from "./id-provider.port";
import type { LoggerPort } from "./logger.port";
import {
  SECURITY_VIOLATION_DETECTED_EVENT,
  SecurityViolationDetectedEvent,
  type SecurityViolationDetectedEventType,
} from "./modules/system/events/SECURITY_VIOLATION_DETECTED_EVENT";
import type { SecurityContext } from "./security-context.vo";
import type { SecurityCountermeasurePort } from "./security-countermeasure.port";

type Dependencies = {
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  Logger: LoggerPort;
  EventStore: EventStoreLike<SecurityViolationDetectedEventType>;
};

export const SecurityCountermeasureBanAdapterError = {
  Executed: "security.countermeasure.ban.adapter.executed",
};

export class SecurityCountermeasureBanAdapter implements SecurityCountermeasurePort {
  constructor(private readonly deps: Dependencies) {}

  async execute(context: SecurityContext) {
    this.deps.Logger.info({
      message: "Security countermeasure ban",
      component: "security",
      operation: "security_countermeasure_ban",
      correlationId: CorrelationStorage.get(),
      metadata: context,
    });

    const event = SecurityViolationDetectedEvent.parse({
      ...createEventEnvelope("security", this.deps),
      name: SECURITY_VIOLATION_DETECTED_EVENT,
      payload: context,
    } satisfies SecurityViolationDetectedEventType);

    await this.deps.EventStore.save([event]);

    throw new Error(SecurityCountermeasureBanAdapterError.Executed);
  }
}
