import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { JobHandlerBareStrategy } from "../src/job-handler-bare.strategy";
import type { MinuteHasPassedEventType } from "../src/modules/system/events/MINUTE_HAS_PASSED_EVENT";
import { PassageOfTimeMinute } from "../src/modules/system/services/passage-of-time-minute.service";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PassageOfTimeMinute", async () => {
  test("correct path", async () => {
    const EventStore = new EventStoreCollectingAdapter<MinuteHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const service = PassageOfTimeMinute({ Clock, EventStore, IdProvider });

    await CorrelationStorage.run(mocks.correlationId, service.handler);

    expect(EventStore.saved).toEqual([mocks.GenericMinuteHasPassedEvent]);
  });

  test("job handler", async () => {
    const EventStore = new EventStoreCollectingAdapter<MinuteHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));
    const JobHandler = new JobHandlerBareStrategy({ IdProvider });
    const service = PassageOfTimeMinute({ Clock, EventStore, IdProvider });

    await CorrelationStorage.run(mocks.correlationId, JobHandler.handle(service).handler);

    expect(EventStore.saved).toEqual([mocks.GenericMinuteHasPassedEvent]);
  });

  test("label", () => {
    const EventStore = new EventStoreCollectingAdapter<MinuteHasPassedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const service = PassageOfTimeMinute({ Clock, EventStore, IdProvider });

    expect(service.label).toEqual("PassageOfTimeMinute");
  });
});
