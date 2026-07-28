import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { BuildInfo, type BuildInfoType } from "../src/build-info.vo";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CommitSha } from "../src/commit-sha.vo";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { CronTaskHandlerBareStrategy } from "../src/cron-task-handler-bare.strategy";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { PassageOfTimeMinuteCronTask } from "../src/modules/system/cron-tasks/passage-of-time-minute";
import type { MinuteHasPassedEventType } from "../src/modules/system/events/MINUTE_HAS_PASSED_EVENT";
import { ReactiveConfigNoopAdapter } from "../src/reactive-config-noop.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const BuildInfoConfig = new ReactiveConfigNoopAdapter<BuildInfoType>(BuildInfo, {
  timestamp: tools.Timestamp.fromNumber(1767775662000).ms,
  version: v.parse(tools.PackageVersionSchema, "v1.0.0"),
  sha: CommitSha.fromString("a".repeat(40)).value,
  size: tools.Size.fromBytes(0).toBytes(),
});

describe("PassageOfTimeMinuteCronTask", async () => {
  test("correct path", async () => {
    const EventStore = new EventStoreCollectingAdapter<MinuteHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const task = PassageOfTimeMinuteCronTask({ Clock, EventStore, IdProvider, BuildInfoConfig });

    await CorrelationStorage.run(mocks.correlationId, task.handler);

    expect(EventStore.saved).toEqual([mocks.GenericMinuteHasPassedEvent]);
  });

  test("cron task handler", async () => {
    const EventStore = new EventStoreCollectingAdapter<MinuteHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));
    const handler = new CronTaskHandlerBareStrategy({ IdProvider });
    const task = PassageOfTimeMinuteCronTask({ Clock, EventStore, IdProvider, BuildInfoConfig });

    await CorrelationStorage.run(mocks.correlationId, handler.handle(task).handler);

    expect(EventStore.saved).toEqual([mocks.GenericMinuteHasPassedEvent]);
  });

  test("label", () => {
    const EventStore = new EventStoreCollectingAdapter<MinuteHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const task = PassageOfTimeMinuteCronTask({ Clock, EventStore, IdProvider, BuildInfoConfig });

    expect(task.label).toEqual("PassageOfTimeMinute");
  });
});
