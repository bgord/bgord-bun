import type { ClockPort } from "../../../clock.port";
import { createEventEnvelope } from "../../../event-envelope";
import type { EventStoreLike } from "../../../event-store-like.types";
import type { IdProviderPort } from "../../../id-provider.port";
import type { UnitOfWork } from "../../../job-handler.strategy";
import { Jobs } from "../../../jobs.service";
import {
  HOUR_HAS_PASSED_EVENT,
  HourHasPassedEvent,
  type HourHasPassedEventType,
} from "../events/HOUR_HAS_PASSED_EVENT";

type Dependencies = {
  EventStore: EventStoreLike<HourHasPassedEventType>;
  Clock: ClockPort;
  IdProvider: IdProviderPort;
};

export class PassageOfTimeHourly implements UnitOfWork {
  constructor(private readonly deps: Dependencies) {}

  static cron = Jobs.SCHEDULES.EVERY_HOUR;

  label = "PassageOfTime";

  async process() {
    const timestamp = this.deps.Clock.nowMs();

    const event = HourHasPassedEvent.parse({
      ...createEventEnvelope("passage_of_time", this.deps),
      name: HOUR_HAS_PASSED_EVENT,
      payload: { timestamp },
    } satisfies HourHasPassedEventType);

    await this.deps.EventStore.save([event]);
  }
}
