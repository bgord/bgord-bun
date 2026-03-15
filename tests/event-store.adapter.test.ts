import { describe, expect, spyOn, test } from "bun:test";
import type { GenericEvent, GenericParsedEvent } from "../src/event.types";
import { EventStoreAdapter } from "../src/event-store.adapter";
import { EventValidatorRegistryZodAdapter } from "../src/event-validator-registry-zod.adapter";
import * as System from "../src/modules/system";
import * as mocks from "./mocks";

type PassageOfTimeEvent = System.Events.HourHasPassedEventType | System.Events.MinuteHasPassedEventType;

const registry = new EventValidatorRegistryZodAdapter<PassageOfTimeEvent>([
  System.Events.HourHasPassedEvent,
  System.Events.MinuteHasPassedEvent,
]);

const serialized = (event: GenericEvent): GenericParsedEvent => ({
  ...event,
  payload: JSON.stringify(event.payload),
});

const finder = async (
  _stream: string,
  _names: ReadonlyArray<GenericEvent["name"]>,
): Promise<ReadonlyArray<GenericParsedEvent>> => [];

const inserter = async (
  events: ReadonlyArray<GenericParsedEvent>,
): Promise<ReadonlyArray<GenericParsedEvent>> => events;

const store = new EventStoreAdapter({ finder, inserter, registry });

describe("EventStoreAdapter", () => {
  test("find - no events", async () => {
    expect(await store.find("passage_of_time")).toEqual([]);
  });

  test("find - one event", async () => {
    const finder = async () => [serialized(mocks.GenericHourHasPassedEvent)];
    const store = new EventStoreAdapter({ finder, inserter, registry });

    expect(await store.find("passage_of_time")).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("find - multiple events", async () => {
    const finder = async () => [
      serialized(mocks.GenericHourHasPassedEvent),
      serialized(mocks.GenericMinuteHasPassedEvent),
    ];
    const store = new EventStoreAdapter({ finder, inserter, registry });

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
    const config = { finder, inserter, registry };
    // TODO use proper collecting inserted adapter in the future
    using captured = spyOn(config, "inserter");
    const store = new EventStoreAdapter(config);

    await store.save([mocks.GenericHourHasPassedEvent]);

    expect(captured).toHaveBeenCalledWith([serialized(mocks.GenericHourHasPassedEvent)]);
  });

  test("save - deserialization", async () => {
    const inserter = async (events: ReadonlyArray<GenericParsedEvent>) =>
      events.map((event) => ({ ...event, payload: JSON.stringify({ wrapped: event.payload }) }));
    const store = new EventStoreAdapter({ finder, inserter, registry });

    const result = await store.save([mocks.GenericHourHasPassedEvent]);

    expect((result[0] as any).payload).toEqual({
      wrapped: JSON.stringify(mocks.GenericHourHasPassedEvent.payload),
    });
  });

  test("save - unique stream", async () => {
    const event = { ...mocks.GenericMinuteHasPassedEvent, stream: "unique_stream" };

    expect(() => store.save([mocks.GenericHourHasPassedEvent, event])).toThrow(
      "event.store.adapter.error.unique.stream",
    );
  });
});
