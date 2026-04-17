import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventFinderLastNoopAdapter } from "../src/event-finder-last-noop.adapter";
import { EventFinderNoopAdapter } from "../src/event-finder-noop.adapter";
import { EventInserterNoopAdapter } from "../src/event-inserter-noop.adapter";
import { EventStoreAdapter } from "../src/event-store.adapter";
import { EventStoreDispatchingAdapter } from "../src/event-store-dispatching.adapter";
import { EventValidatorRegistryAdapter } from "../src/event-validator-registry.adapter";
import { HandlerWithLoggerSafeStrategy } from "../src/handler-with-logger-safe.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { EventBusCollectingAdapter } from "../src/message-bus-collecting.adapter";
import { EventBusEmitteryAdapter } from "../src/message-bus-emittery.adapter";
import * as System from "../src/modules/system";
import { PayloadSerializerJsonAdapter } from "../src/payload-serializer-json.adapter";
import * as mocks from "./mocks";

type PassageOfTimeEvent = System.Events.HourHasPassedEventType | System.Events.MinuteHasPassedEventType;

const registry = new EventValidatorRegistryAdapter<PassageOfTimeEvent>({
  [System.Events.HOUR_HAS_PASSED_EVENT]: System.Events.HourHasPassedEvent,
  [System.Events.MINUTE_HAS_PASSED_EVENT]: System.Events.MinuteHasPassedEvent,
});

const finder = new EventFinderNoopAdapter([]);
const finderLast = new EventFinderLastNoopAdapter(null);
const inserter = new EventInserterNoopAdapter();
const serializer = new PayloadSerializerJsonAdapter();

const serialized = (event: PassageOfTimeEvent) => ({
  ...event,
  payload: serializer.serialize(event.payload),
});

describe("EventStoreDispatchingAdapter", () => {
  test("find", async () => {
    const finder = new EventFinderNoopAdapter([serialized(mocks.GenericHourHasPassedEvent)]);
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, finderLast, inserter, serializer });
    const EventBus = new EventBusCollectingAdapter<PassageOfTimeEvent>();
    const store = new EventStoreDispatchingAdapter<PassageOfTimeEvent>({ inner, EventBus });

    expect(await store.find(registry, "passage_of_time")).toEqual([mocks.GenericHourHasPassedEvent]);
    expect(EventBus.messages).toEqual([]);
  });

  test("findLast", async () => {
    const finderLast = new EventFinderLastNoopAdapter(serialized(mocks.GenericHourHasPassedEvent));
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, finderLast, inserter, serializer });
    const EventBus = new EventBusCollectingAdapter<PassageOfTimeEvent>();
    const store = new EventStoreDispatchingAdapter<PassageOfTimeEvent>({ inner, EventBus });

    expect(await store.findLast(registry, "passage_of_time")).toEqual(mocks.GenericHourHasPassedEvent);
    expect(EventBus.messages).toEqual([]);
  });

  test("findLast - no event", async () => {
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, finderLast, inserter, serializer });
    const EventBus = new EventBusCollectingAdapter<PassageOfTimeEvent>();
    const store = new EventStoreDispatchingAdapter<PassageOfTimeEvent>({ inner, EventBus });

    expect(await store.findLast(registry, "passage_of_time")).toEqual(null);
    expect(EventBus.messages).toEqual([]);
  });

  test("save - one event", async () => {
    const finder = new EventFinderNoopAdapter([]);
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, finderLast, inserter, serializer });
    const EventBus = new EventBusCollectingAdapter<PassageOfTimeEvent>();
    const store = new EventStoreDispatchingAdapter<PassageOfTimeEvent>({ inner, EventBus });

    expect(await store.save([mocks.GenericHourHasPassedEvent])).toEqual([mocks.GenericHourHasPassedEvent]);
    expect(EventBus.messages).toEqual([mocks.GenericHourHasPassedEvent]);
  });

  test("save - dispatching - safe handler", async () => {
    const Logger = new LoggerCollectingAdapter();
    const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
    const finder = new EventFinderNoopAdapter([]);
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, finderLast, inserter, serializer });
    const handler = new HandlerWithLoggerSafeStrategy({ Logger, Clock });
    const EventBus = new EventBusEmitteryAdapter<PassageOfTimeEvent>();
    EventBus.on(System.Events.HOUR_HAS_PASSED_EVENT, handler.handle(mocks.throwIntentionalErrorAsync));
    const store = new EventStoreDispatchingAdapter<PassageOfTimeEvent>({ inner, EventBus });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await store.save([mocks.GenericHourHasPassedEvent])).toEqual([mocks.GenericHourHasPassedEvent]);

      await mocks.tick();

      expect(Logger.entries).toEqual([
        {
          message: `Unknown ${mocks.GenericHourHasPassedEvent.name} handler error`,
          correlationId: CorrelationStorage.get(),
          component: "infra",
          operation: "handler_safe",
          metadata: { name: mocks.GenericHourHasPassedEvent.name, duration: expect.any(tools.Duration) },
          error: new Error(mocks.IntentionalError),
        },
      ]);
    });
  });

  test("save - multiple events", async () => {
    const finder = new EventFinderNoopAdapter([]);
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, finderLast, inserter, serializer });
    const EventBus = new EventBusCollectingAdapter<PassageOfTimeEvent>();
    const store = new EventStoreDispatchingAdapter<PassageOfTimeEvent>({ inner, EventBus });

    expect(await store.save([mocks.GenericHourHasPassedEvent, mocks.GenericMinuteHasPassedEvent])).toEqual([
      mocks.GenericHourHasPassedEvent,
      mocks.GenericMinuteHasPassedEvent,
    ]);
    expect(EventBus.messages).toEqual([mocks.GenericHourHasPassedEvent, mocks.GenericMinuteHasPassedEvent]);
  });
});
