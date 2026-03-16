import { describe, expect, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventFinderNoopAdapter } from "../src/event-finder-noop.adapter";
import { EventInserterNoopAdapter } from "../src/event-inserter-noop.adapter";
import { EventSerializerJsonAdapter } from "../src/event-serializer-json.adapter";
import { EventStoreAdapter } from "../src/event-store.adapter";
import { EventStoreWithLoggerAdapter } from "../src/event-store-with-logger.adapter";
import { EventValidatorRegistryAdapter } from "../src/event-validator-registry.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as System from "../src/modules/system";
import * as mocks from "./mocks";

type PassageOfTimeEvent = System.Events.HourHasPassedEventType | System.Events.MinuteHasPassedEventType;

const registry = new EventValidatorRegistryAdapter<PassageOfTimeEvent>({
  [System.Events.HOUR_HAS_PASSED_EVENT]: System.Events.HourHasPassedEvent,
  [System.Events.MINUTE_HAS_PASSED_EVENT]: System.Events.MinuteHasPassedEvent,
});

const serializer = new EventSerializerJsonAdapter();
const inserter = new EventInserterNoopAdapter();

const serialized = (event: PassageOfTimeEvent) => ({
  ...event,
  payload: serializer.serialize(event.payload),
});

describe("EventStoreWithLoggerAdapter", () => {
  test("find", async () => {
    const finder = new EventFinderNoopAdapter([serialized(mocks.GenericHourHasPassedEvent)]);
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, inserter, serializer });
    const Logger = new LoggerCollectingAdapter();
    const store = new EventStoreWithLoggerAdapter<PassageOfTimeEvent>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await store.find(registry, "passage_of_time")).toEqual([mocks.GenericHourHasPassedEvent]);
    });

    expect(Logger.entries).toEqual([
      {
        message: "Event store find",
        component: "infra",
        operation: "event_store_find",
        correlationId: mocks.correlationId,
        metadata: {
          stream: "passage_of_time",
          names: ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"],
          count: 1,
        },
      },
    ]);
  });

  test("save", async () => {
    const finder = new EventFinderNoopAdapter([]);
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, inserter, serializer });
    const Logger = new LoggerCollectingAdapter();
    const store = new EventStoreWithLoggerAdapter<PassageOfTimeEvent>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await store.save([mocks.GenericHourHasPassedEvent])).toEqual([mocks.GenericHourHasPassedEvent]);
    });

    expect(Logger.entries).toEqual([
      {
        message: "Event store save",
        component: "infra",
        operation: "event_store_save",
        correlationId: mocks.correlationId,
        metadata: { stream: "passage_of_time", names: ["HOUR_HAS_PASSED_EVENT"], count: 1 },
      },
    ]);
  });
});
