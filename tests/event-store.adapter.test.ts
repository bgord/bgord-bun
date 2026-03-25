import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { GenericEvent, GenericEventSerialized } from "../src/event.types";
import { EventEnvelopeSchema } from "../src/event-envelope";
import { EventFinderNoopAdapter } from "../src/event-finder-noop.adapter";
import { EventInserterNoopAdapter } from "../src/event-inserter-noop.adapter";
import { EventSerializerCollectingAdapter } from "../src/event-serializer-collecting.adapter";
import { EventSerializerJsonAdapter } from "../src/event-serializer-json.adapter";
import { EventStoreAdapter } from "../src/event-store.adapter";
import { EventUpcasterChainAdapter } from "../src/event-upcaster-chain.adapter";
import { EventUpcasterStep } from "../src/event-upcaster-step.vo";
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

const store = new EventStoreAdapter({ finder, inserter, serializer });

describe("EventStoreAdapter", () => {
  test("find - no events", async () => {
    expect(await store.find(registry, "passage_of_time")).toEqual([]);
  });

  test("find - one event", async () => {
    const finder = new EventFinderNoopAdapter([serialized(mocks.GenericHourHasPassedEvent)]);
    const store = new EventStoreAdapter({ finder, inserter, serializer });

    expect(await store.find(registry, "passage_of_time")).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("find - multiple events", async () => {
    const finder = new EventFinderNoopAdapter([
      serialized(mocks.GenericHourHasPassedEvent),
      serialized(mocks.GenericMinuteHasPassedEvent),
    ]);
    const store = new EventStoreAdapter({ finder, inserter, serializer });

    expect(await store.find(registry, "passage_of_time")).toEqual([
      mocks.GenericHourHasPassedEvent,
      mocks.GenericMinuteHasPassedEvent,
    ]);
  });

  test("find - with upcaster", async () => {
    const HourHasPassedEventV2 = v.object({
      ...EventEnvelopeSchema,
      version: v.literal(2),
      name: v.literal(System.Events.HOUR_HAS_PASSED_EVENT),
      payload: v.object({ timestamp: tools.TimestampValue, source: v.string() }),
    });

    type HourHasPassedEventV2Type = v.InferOutput<typeof HourHasPassedEventV2>;

    const registry = new EventValidatorRegistryAdapter<HourHasPassedEventV2Type>({
      [System.Events.HOUR_HAS_PASSED_EVENT]: HourHasPassedEventV2,
    });

    const upcaster = new EventUpcasterChainAdapter({
      HOUR_HAS_PASSED_EVENT: [
        new EventUpcasterStep<System.Events.HourHasPassedEventType, HourHasPassedEventV2Type>({
          fromVersion: 1,
          toVersion: 2,
          upcast: (payload) => ({ ...payload, source: "system" }),
        }),
      ],
    });
    const finder = new EventFinderNoopAdapter([serialized(mocks.GenericHourHasPassedEvent)]);
    const store = new EventStoreAdapter({ finder, inserter, serializer, upcaster });

    expect(await store.find(registry, "passage_of_time")).toEqual([
      {
        ...mocks.GenericHourHasPassedEvent,
        version: 2,
        payload: { ...mocks.GenericHourHasPassedEvent.payload, source: "system" },
      },
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
    const store = new EventStoreAdapter({ finder, inserter, serializer });

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
