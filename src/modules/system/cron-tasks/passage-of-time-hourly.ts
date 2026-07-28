import type { BuildInfoType } from "../../../build-info.vo";
import type { ClockPort } from "../../../clock.port";
import { CronExpressionSchedules } from "../../../cron-expression.vo";
import type { CronTask } from "../../../cron-task.vo";
import { event } from "../../../event-envelope";
import type { EventStorePort } from "../../../event-store.port";
import type { IdProviderPort } from "../../../id-provider.port";
import type { ReactiveConfigPort } from "../../../reactive-config.port";
import { HourHasPassedEvent, type HourHasPassedEventType } from "../events/HOUR_HAS_PASSED_EVENT";

type Dependencies = {
  EventStore: EventStorePort<HourHasPassedEventType>;
  Clock: ClockPort;
  IdProvider: IdProviderPort;
  BuildInfoConfig: ReactiveConfigPort<BuildInfoType>;
};

export const PassageOfTimeHourlyCronTask = (deps: Dependencies): CronTask => ({
  label: "PassageOfTimeHourly",
  cron: CronExpressionSchedules.EVERY_HOUR,
  handler: async () => {
    await deps.EventStore.save([
      await event(HourHasPassedEvent, "passage_of_time", { timestamp: deps.Clock.now().ms }, deps),
    ]);
  },
});
