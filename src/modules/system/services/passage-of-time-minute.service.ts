import type { ClockPort } from "../../../clock.port";
import { CronExpressionSchedules } from "../../../cron-expression.vo";
import type { CronTask } from "../../../cron-task.vo";
import { event } from "../../../event-envelope";
import type { EventStorePort } from "../../../event-store.port";
import type { IdProviderPort } from "../../../id-provider.port";
import { MinuteHasPassedEvent, type MinuteHasPassedEventType } from "../events/MINUTE_HAS_PASSED_EVENT";

type Dependencies = {
  EventStore: EventStorePort<MinuteHasPassedEventType>;
  Clock: ClockPort;
  IdProvider: IdProviderPort;
};

export const PassageOfTimeMinute = (deps: Dependencies): CronTask => ({
  label: "PassageOfTimeMinute",
  cron: CronExpressionSchedules.EVERY_MINUTE,
  handler: async () => {
    await deps.EventStore.save([
      event(MinuteHasPassedEvent, "passage_of_time", { timestamp: deps.Clock.now().ms }, deps),
    ]);
  },
});
