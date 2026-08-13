import * as v from "valibot";
import type { ClockPort } from "../../../clock.port";
import type { CommitShaValueType } from "../../../commit-sha-value.vo";
import { CronExpressionSchedules } from "../../../cron-expression.vo";
import type { CronTask } from "../../../cron-task.vo";
import { event } from "../../../event-envelope";
import type { EventStorePort } from "../../../event-store.port";
import { EventStream } from "../../../event-stream.vo";
import type { IdProviderPort } from "../../../id-provider.port";
import type { StaticConfigPort } from "../../../static-config.port";
import { HourHasPassedEvent, type HourHasPassedEventType } from "../events/HOUR_HAS_PASSED_EVENT";

type Dependencies = {
  EventStore: EventStorePort<HourHasPassedEventType>;
  Clock: ClockPort;
  IdProvider: IdProviderPort;
  CommitConfig: StaticConfigPort<CommitShaValueType>;
};

export const PassageOfTimeHourlyCronTask = (deps: Dependencies): CronTask => ({
  label: "PassageOfTimeHourly",
  cron: CronExpressionSchedules.EVERY_HOUR,
  handler: async () => {
    await deps.EventStore.save([
      event(
        HourHasPassedEvent,
        v.parse(EventStream, "passage_of_time"),
        { timestamp: deps.Clock.now().ms },
        deps,
      ),
    ]);
  },
});
