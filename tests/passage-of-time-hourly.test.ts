import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CommitSha } from "../src/commit-sha.vo";
import type { CommitShaValueType } from "../src/commit-sha-value.vo";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { CronTaskHandlerBareStrategy } from "../src/cron-task-handler-bare.strategy";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { PassageOfTimeHourlyCronTask } from "../src/modules/system/cron-tasks/passage-of-time-hourly";
import type { HourHasPassedEventType } from "../src/modules/system/events/HOUR_HAS_PASSED_EVENT";
import { StaticConfigAdapter } from "../src/static-config.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const CommitConfig = new StaticConfigAdapter<CommitShaValueType>(CommitSha.fromString("a".repeat(40)).value);

describe("PassageOfTimeHourlyCronTask", async () => {
  test("correct path", async () => {
    const EventStore = new EventStoreCollectingAdapter<HourHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const task = PassageOfTimeHourlyCronTask({ Clock, EventStore, IdProvider, CommitConfig });

    await CorrelationStorage.run(mocks.correlationId, task.handler);

    expect(EventStore.saved).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("cron task handler", async () => {
    const EventStore = new EventStoreCollectingAdapter<HourHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));
    const handler = new CronTaskHandlerBareStrategy({ IdProvider });
    const task = PassageOfTimeHourlyCronTask({ Clock, EventStore, IdProvider, CommitConfig });

    await CorrelationStorage.run(mocks.correlationId, handler.handle(task).handler);

    expect(EventStore.saved).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("label", () => {
    const EventStore = new EventStoreCollectingAdapter<HourHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const task = PassageOfTimeHourlyCronTask({ Clock, EventStore, IdProvider, CommitConfig });

    expect(task.label).toEqual("PassageOfTimeHourly");
  });
});
