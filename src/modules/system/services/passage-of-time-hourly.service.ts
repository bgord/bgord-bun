import * as v from "valibot";
import type { ClockPort } from "../../../clock.port";
import { createEventEnvelope } from "../../../event-envelope";
import type { EventStorePort } from "../../../event-store.port";
import type { IdProviderPort } from "../../../id-provider.port";
import type { UnitOfWork } from "../../../job-handler.strategy";
import { Jobs } from "../../../jobs.service";
import {
  HOUR_HAS_PASSED_EVENT,
  HourHasPassedEvent,
  type HourHasPassedEventType,
} from "../events/HOUR_HAS_PASSED_EVENT";

type Dependencies = {
  EventStore: EventStorePort<HourHasPassedEventType>;
  Clock: ClockPort;
  IdProvider: IdProviderPort;
};

export class PassageOfTimeHourly implements UnitOfWork {
  constructor(private readonly deps: Dependencies) {}

  static cron = Jobs.SCHEDULES.EVERY_HOUR;

  label = "PassageOfTime";

  async process() {
    const event = v.parse(HourHasPassedEvent, {
      ...createEventEnvelope("passage_of_time", this.deps),
      name: HOUR_HAS_PASSED_EVENT,
      payload: { timestamp: this.deps.Clock.now().ms },
    } satisfies HourHasPassedEventType);

    await this.deps.EventStore.save([event]);
  }
}
