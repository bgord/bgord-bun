import { describe, expect, test } from "bun:test";
import type { GenericEvent, GenericEventSerialized } from "../src/event.types";
import { EventFinderNoopAdapter } from "../src/event-finder-noop.adapter";
import { EventInserterNoopAdapter } from "../src/event-inserter-noop.adapter";
import { EventSerializerCollectingAdapter } from "../src/event-serializer-collecting.adapter";
import { EventSerializerJsonAdapter } from "../src/event-serializer-json.adapter";
import { EventStoreAdapter } from "../src/event-store.adapter";
import { EventValidatorRegistryZodAdapter } from "../src/event-validator-registry-zod.adapter";
import * as System from "../src/modules/system";
import * as mocks from "./mocks";

type PassageOfTimeEvent = System.Events.HourHasPassedEventType | System.Events.MinuteHasPassedEventType;

const registry = new EventValidatorRegistryZodAdapter<PassageOfTimeEvent>([
  System.Events.HourHasPassedEvent,
  System.Events.MinuteHasPassedEvent,
]);
const serializer = new EventSerializerJsonAdapter();

const serialized = (event: GenericEvent): GenericEventSerialized => ({
  ...event,
  payload: JSON.stringify(event.payload),
});

const finder = new EventFinderNoopAdapter([]);
const inserter = new EventInserterNoopAdapter();

const store = new EventStoreAdapter({ finder, inserter, registry, serializer });

describe("EventStoreAdapter", () => {
  test("find - no events", async () => {
    expect(await store.find("passage_of_time")).toEqual([]);
  });

  test("find - one event", async () => {
    const finder = new EventFinderNoopAdapter([serialized(mocks.GenericHourHasPassedEvent)]);
    const store = new EventStoreAdapter({ finder, inserter, registry, serializer });

    expect(await store.find("passage_of_time")).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("find - multiple events", async () => {
    const finder = new EventFinderNoopAdapter([
      serialized(mocks.GenericHourHasPassedEvent),
      serialized(mocks.GenericMinuteHasPassedEvent),
    ]);
    const store = new EventStoreAdapter({ finder, inserter, registry, serializer });

    expect(await store.find("passage_of_time")).toEqual([
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
    const store = new EventStoreAdapter({ finder, inserter, registry, serializer });

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
