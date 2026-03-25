import { describe, expect, test } from "bun:test";
import type { GenericEvent, GenericEventSerialized } from "../src/event.types";
import { EventFinderNoopAdapter } from "../src/event-finder-noop.adapter";
import { EventInserterNoopAdapter } from "../src/event-inserter-noop.adapter";
import { EventSerializerCollectingAdapter } from "../src/event-serializer-collecting.adapter";
import { EventSerializerJsonAdapter } from "../src/event-serializer-json.adapter";
import { EventStoreAdapter } from "../src/event-store.adapter";
import { EventUpcasterRegistryNoopAdapter } from "../src/event-upcaster-registry-noop.adapter";
import { EventValidatorRegistryAdapter } from "../src/event-validator-registry.adapter";
import * as System from "../src/modules/system";
import * as mocks from "./mocks";

type PassageOfTimeEvent = System.Events.HourHasPassedEventType | System.Events.MinuteHasPassedEventType;

const registry = new EventValidatorRegistryAdapter<PassageOfTimeEvent>({
  [System.Events.HOUR_HAS_PASSED_EVENT]: System.Events.HourHasPassedEvent,
  [System.Events.MINUTE_HAS_PASSED_EVENT]: System.Events.MinuteHasPassedEvent,
});
const serializer = new EventSerializerJsonAdapter();

const serialized = (event: GenericEvent): GenericEventSerialized => ({
  ...event,
  payload: JSON.stringify(event.payload),
});

const finder = new EventFinderNoopAdapter([]);
const inserter = new EventInserterNoopAdapter();
const upcaster = new EventUpcasterRegistryNoopAdapter();

const store = new EventStoreAdapter({ finder, inserter, serializer, upcaster });

describe("EventStoreAdapter", () => {
  test("find - no events", async () => {
    expect(await store.find(registry, "passage_of_time")).toEqual([]);
  });

  test("find - one event", async () => {
    const finder = new EventFinderNoopAdapter([serialized(mocks.GenericHourHasPassedEvent)]);
    const store = new EventStoreAdapter({ finder, inserter, serializer, upcaster });

    expect(await store.find(registry, "passage_of_time")).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("find - multiple events", async () => {
    const finder = new EventFinderNoopAdapter([
      serialized(mocks.GenericHourHasPassedEvent),
      serialized(mocks.GenericMinuteHasPassedEvent),
    ]);
    const store = new EventStoreAdapter({ finder, inserter, serializer, upcaster });

    expect(await store.find(registry, "passage_of_time")).toEqual([
      mocks.GenericHourHasPassedEvent,
      mocks.GenericMinuteHasPassedEvent,
    ]);
  });

  test("save - no events", async () => {
    expect(await store.save([])).toEqual([]);
  });

  test("save - one event", async () => {
    expect(await store.save([mocks.GenericHourHasPassedEvent])).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("save - multiple events", async () => {
    expect(await store.save([mocks.GenericHourHasPassedEvent, mocks.GenericMinuteHasPassedEvent])).toEqual([
      mocks.GenericHourHasPassedEvent,
      mocks.GenericMinuteHasPassedEvent,
    ]);
  });

  test("save - serialization", async () => {
    const serializer = new EventSerializerCollectingAdapter();
    const store = new EventStoreAdapter({ finder, inserter, serializer, upcaster });

    await store.save([mocks.GenericHourHasPassedEvent]);

    expect(serializer.serialized).toEqual([mocks.GenericHourHasPassedEvent.payload]);
  });

  test("save - unique stream", async () => {
    const event = { ...mocks.GenericMinuteHasPassedEvent, stream: "unique_stream" };

    expect(() => store.save([mocks.GenericHourHasPassedEvent, event])).toThrow(
      "event.store.adapter.error.unique.stream",
    );
  });
});
