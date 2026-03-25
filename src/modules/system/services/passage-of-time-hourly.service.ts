import type { ClockPort } from "../../../clock.port";
import { event } from "../../../event-envelope";
import type { EventStorePort } from "../../../event-store.port";
import type { IdProviderPort } from "../../../id-provider.port";
import type { UnitOfWork } from "../../../job-handler.strategy";
import { Jobs } from "../../../jobs.service";
import { HourHasPassedEvent, type HourHasPassedEventType } from "../events/HOUR_HAS_PASSED_EVENT";

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
    await this.deps.EventStore.save([
      event(HourHasPassedEvent, "passage_of_time", { timestamp: this.deps.Clock.now().ms }, this.deps),
    ]);
  }
}
