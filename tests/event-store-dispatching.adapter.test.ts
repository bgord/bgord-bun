import { describe, expect, test } from "bun:test";
import { EventFinderNoopAdapter } from "../src/event-finder-noop.adapter";
import { EventInserterNoopAdapter } from "../src/event-inserter-noop.adapter";
import { EventSerializerJsonAdapter } from "../src/event-serializer-json.adapter";
import { EventStoreAdapter } from "../src/event-store.adapter";
import { EventStoreDispatchingAdapter } from "../src/event-store-dispatching.adapter";
import { EventValidatorRegistryAdapter } from "../src/event-validator-registry.adapter";
import { EventBusCollectingAdapter } from "../src/message-bus-collecting.adapter";
import * as System from "../src/modules/system";
import * as mocks from "./mocks";

type PassageOfTimeEvent = System.Events.HourHasPassedEventType | System.Events.MinuteHasPassedEventType;

const registry = new EventValidatorRegistryAdapter<PassageOfTimeEvent>({
  [System.Events.HOUR_HAS_PASSED_EVENT]: System.Events.HourHasPassedEvent,
  [System.Events.MINUTE_HAS_PASSED_EVENT]: System.Events.MinuteHasPassedEvent,
});

const inserter = new EventInserterNoopAdapter();
const serializer = new EventSerializerJsonAdapter();

const serialized = (event: PassageOfTimeEvent) => ({
  ...event,
  payload: serializer.serialize(event.payload),
});

describe("EventStoreDispatchingAdapter", () => {
  test("find", async () => {
    const finder = new EventFinderNoopAdapter([serialized(mocks.GenericHourHasPassedEvent)]);
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, inserter, serializer });
    const EventBus = new EventBusCollectingAdapter<PassageOfTimeEvent>();
    const store = new EventStoreDispatchingAdapter<PassageOfTimeEvent>({ inner, EventBus });

    expect(await store.find(registry, "passage_of_time")).toEqual([mocks.GenericHourHasPassedEvent]);
    expect(EventBus.messages).toEqual([]);
  });

  test("save - one event", async () => {
    const finder = new EventFinderNoopAdapter([]);
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, inserter, serializer });
    const EventBus = new EventBusCollectingAdapter<PassageOfTimeEvent>();
    const store = new EventStoreDispatchingAdapter<PassageOfTimeEvent>({ inner, EventBus });

    expect(await store.save([mocks.GenericHourHasPassedEvent])).toEqual([mocks.GenericHourHasPassedEvent]);
    expect(EventBus.messages).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("save - multiple events", async () => {
    const finder = new EventFinderNoopAdapter([]);
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, inserter, serializer });
    const EventBus = new EventBusCollectingAdapter<PassageOfTimeEvent>();
    const store = new EventStoreDispatchingAdapter<PassageOfTimeEvent>({ inner, EventBus });

    expect(await store.save([mocks.GenericHourHasPassedEvent, mocks.GenericMinuteHasPassedEvent])).toEqual([
      mocks.GenericHourHasPassedEvent,
      mocks.GenericMinuteHasPassedEvent,
    ]);
    expect(EventBus.messages).toEqual([mocks.GenericHourHasPassedEvent, mocks.GenericMinuteHasPassedEvent]);
  });
});
