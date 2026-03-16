import * as v from "valibot";
import type { ClockPort } from "../../../clock.port";
import { createEventEnvelope } from "../../../event-envelope";
import type { EventStorePort } from "../../../event-store.port";
import type { IdProviderPort } from "../../../id-provider.port";
import type { UnitOfWork } from "../../../job-handler.strategy";
import { Jobs } from "../../../jobs.service";
import {
  MINUTE_HAS_PASSED_EVENT,
  MinuteHasPassedEvent,
  type MinuteHasPassedEventType,
} from "../events/MINUTE_HAS_PASSED_EVENT";

type Dependencies = {
  EventStore: EventStorePort<MinuteHasPassedEventType>;
  Clock: ClockPort;
  IdProvider: IdProviderPort;
};

export class PassageOfTimeMinute implements UnitOfWork {
  constructor(private readonly deps: Dependencies) {}

  static cron = Jobs.SCHEDULES.EVERY_MINUTE;

  label = "PassageOfTime";

  async process() {
    const event = v.parse(MinuteHasPassedEvent, {
      ...createEventEnvelope("passage_of_time", this.deps),
      name: MINUTE_HAS_PASSED_EVENT,
      payload: { timestamp: this.deps.Clock.now().ms },
    } satisfies MinuteHasPassedEventType);

    await this.deps.EventStore.save([event]);
  }
}
