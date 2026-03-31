import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { CronTaskHandlerBareStrategy } from "../src/cron-task-handler-bare.strategy";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { PassageOfTimeHourlyCronTask } from "../src/modules/system/cron-tasks/passage-of-time-hourly";
import type { HourHasPassedEventType } from "../src/modules/system/events/HOUR_HAS_PASSED_EVENT";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PassageOfTimeHourlyCronTask", async () => {
  test("correct path", async () => {
    const EventStore = new EventStoreCollectingAdapter<HourHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const task = PassageOfTimeHourlyCronTask({ Clock, EventStore, IdProvider });

    await CorrelationStorage.run(mocks.correlationId, task.handler);

    expect(EventStore.saved).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("cron task handler", async () => {
    const EventStore = new EventStoreCollectingAdapter<HourHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));
    const handler = new CronTaskHandlerBareStrategy({ IdProvider });
    const task = PassageOfTimeHourlyCronTask({ Clock, EventStore, IdProvider });

    await CorrelationStorage.run(mocks.correlationId, handler.handle(task).handler);

    expect(EventStore.saved).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("label", () => {
    const EventStore = new EventStoreCollectingAdapter<HourHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const task = PassageOfTimeHourlyCronTask({ Clock, EventStore, IdProvider });

    expect(task.label).toEqual("PassageOfTimeHourly");
  });
});
