import * as v from "valibot";
import type { ClockPort } from "./clock.port";
import type { CommitShaValueType } from "./commit-sha-value.vo";
import { CorrelationStorage } from "./correlation-storage.service";
import { event } from "./event-envelope";
import type { EventStorePort } from "./event-store.port";
import { EventStream } from "./event-stream.vo";
import type { IdProviderPort } from "./id-provider.port";
import type { LoggerPort } from "./logger.port";
import {
  SecurityViolationDetectedEvent,
  type SecurityViolationDetectedEventType,
} from "./modules/system/events/SECURITY_VIOLATION_DETECTED_EVENT";
import type { SecurityContext } from "./security-context.vo";
import type { SecurityAction, SecurityCountermeasureStrategy } from "./security-countermeasure.strategy";
import {
  SecurityCountermeasureName,
  type SecurityCountermeasureNameType,
} from "./security-countermeasure-name.vo";
import type { StaticConfigPort } from "./static-config.port";

export const SecurityCountermeasureBanStrategyError = {
  Executed: "security.countermeasure.ban.strategy.executed",
};

type Dependencies = {
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  Logger: LoggerPort;
  EventStore: EventStorePort<SecurityViolationDetectedEventType>;
  CommitConfig: StaticConfigPort<CommitShaValueType>;
};

type Config = { response: { status: number } };

export class SecurityCountermeasureBanStrategy implements SecurityCountermeasureStrategy {
  constructor(
    private readonly deps: Dependencies,
    private readonly config: Config = { response: { status: 403 } },
  ) {}

  async execute(context: SecurityContext): Promise<SecurityAction> {
    const action = {
      kind: "deny",
      reason: SecurityCountermeasureBanStrategyError.Executed,
      ...this.config,
    } as const;

    this.deps.Logger.info({
      message: "Security countermeasure ban",
      component: "security",
      operation: "security_countermeasure_ban",
      correlationId: CorrelationStorage.get(),
      metadata: context,
    });

    await this.deps.EventStore.save([
      event(
        SecurityViolationDetectedEvent,
        v.parse(EventStream, "security"),
        { action: action.kind, ...context },
        this.deps,
      ),
    ]);

    return action;
  }

  get name(): SecurityCountermeasureNameType {
    return v.parse(SecurityCountermeasureName, "ban");
  }
}
