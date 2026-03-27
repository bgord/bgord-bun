import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { CronTaskHandlerBareStrategy } from "../src/cron-task-handler-bare.strategy";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import type { HourHasPassedEventType } from "../src/modules/system/events/HOUR_HAS_PASSED_EVENT";
import { PassageOfTimeHourly } from "../src/modules/system/services/passage-of-time-hourly.service";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PassageOfTimeHourly", async () => {
  test("correct path", async () => {
    const EventStore = new EventStoreCollectingAdapter<HourHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const service = PassageOfTimeHourly({ Clock, EventStore, IdProvider });

    await CorrelationStorage.run(mocks.correlationId, service.handler);

    expect(EventStore.saved).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("job handler", async () => {
    const EventStore = new EventStoreCollectingAdapter<HourHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));
    const JobHandler = new CronTaskHandlerBareStrategy({ IdProvider });
    const service = PassageOfTimeHourly({ Clock, EventStore, IdProvider });

    await CorrelationStorage.run(mocks.correlationId, JobHandler.handle(service).handler);

    expect(EventStore.saved).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("label", () => {
    const EventStore = new EventStoreCollectingAdapter<HourHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const service = PassageOfTimeHourly({ Clock, EventStore, IdProvider });

    expect(service.label).toEqual("PassageOfTimeHourly");
  });
});
