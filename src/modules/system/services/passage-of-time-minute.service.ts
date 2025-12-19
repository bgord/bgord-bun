import type { ClockPort } from "../../../clock.port";
import { createEventEnvelope } from "../../../event-envelope";
import type { EventStoreLike } from "../../../event-store-like.types";
import type { IdProviderPort } from "../../../id-provider.port";
import type { UnitOfWork } from "../../../job-handler.port";
import { Jobs } from "../../../jobs.service";
import {
  MINUTE_HAS_PASSED_EVENT,
  MinuteHasPassedEvent,
  type MinuteHasPassedEventType,
} from "../events/MINUTE_HAS_PASSED_EVENT";

type Dependencies = {
  EventStore: EventStoreLike<MinuteHasPassedEventType>;
  Clock: ClockPort;
  IdProvider: IdProviderPort;
};

export class PassageOfTimeMinute implements UnitOfWork {
  constructor(private readonly deps: Dependencies) {}

  static cron = Jobs.SCHEDULES.EVERY_MINUTE;

  label = "PassageOfTime";

  async process() {
    const timestamp = this.deps.Clock.nowMs();

    const event = MinuteHasPassedEvent.parse({
      ...createEventEnvelope("passage_of_time", this.deps),
      name: MINUTE_HAS_PASSED_EVENT,
      payload: { timestamp },
    } satisfies MinuteHasPassedEventType);

    await this.deps.EventStore.save([event]);
  }
}
