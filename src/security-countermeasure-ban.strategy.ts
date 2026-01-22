import type { ContentfulStatusCode } from "hono/utils/http-status";
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
import type { SecurityAction, SecurityCountermeasureStrategy } from "./security-countermeasure.strategy";
import {
  SecurityCountermeasureName,
  type SecurityCountermeasureNameType,
} from "./security-countermeasure-name.vo";

type Dependencies = {
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  Logger: LoggerPort;
  EventStore: EventStoreLike<SecurityViolationDetectedEventType>;
};

export const SecurityCountermeasureBanStrategyError = {
  Executed: "security.countermeasure.ban.strategy.executed",
};

export class SecurityCountermeasureBanStrategy implements SecurityCountermeasureStrategy {
  constructor(
    private readonly deps: Dependencies,
    private readonly config: { response: { status: ContentfulStatusCode } } = { response: { status: 403 } },
  ) {}

  async execute(context: SecurityContext): Promise<SecurityAction> {
    const action = {
      kind: "deny",
      reason: SecurityCountermeasureBanStrategyError.Executed,
      ...this.config,
    } as const;

    this.deps.Logger.warn({
      message: "Security countermeasure ban",
      component: "security",
      operation: "security_countermeasure_ban",
      correlationId: CorrelationStorage.get(),
      metadata: context,
    });

    const event = SecurityViolationDetectedEvent.parse({
      ...createEventEnvelope("security", this.deps),
      name: SECURITY_VIOLATION_DETECTED_EVENT,
      payload: { ...context, countermeasure: this.name, action: action.kind },
    } satisfies SecurityViolationDetectedEventType);

    await this.deps.EventStore.save([event]);

    return action;
  }

  get name(): SecurityCountermeasureNameType {
    return SecurityCountermeasureName.parse("ban");
  }
}
