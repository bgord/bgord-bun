import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventFinderLastNoopAdapter } from "../src/event-finder-last-noop.adapter";
import { EventFinderNoopAdapter } from "../src/event-finder-noop.adapter";
import { EventInserterNoopAdapter } from "../src/event-inserter-noop.adapter";
import { EventStoreAdapter } from "../src/event-store.adapter";
import { EventStoreWithLoggerAdapter } from "../src/event-store-with-logger.adapter";
import { EventValidatorRegistryAdapter } from "../src/event-validator-registry.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as System from "../src/modules/system";
import { PayloadSerializerJsonAdapter } from "../src/payload-serializer-json.adapter";
import * as mocks from "./mocks";

type PassageOfTimeEvent = System.Events.HourHasPassedEventType | System.Events.MinuteHasPassedEventType;

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

const registry = new EventValidatorRegistryAdapter<PassageOfTimeEvent>({
  [System.Events.HOUR_HAS_PASSED_EVENT]: System.Events.HourHasPassedEvent,
  [System.Events.MINUTE_HAS_PASSED_EVENT]: System.Events.MinuteHasPassedEvent,
});

const finder = new EventFinderNoopAdapter([]);
const finderLast = new EventFinderLastNoopAdapter(null);
const serializer = new PayloadSerializerJsonAdapter();
const inserter = new EventInserterNoopAdapter();

const serialized = (event: PassageOfTimeEvent) => ({
  ...event,
  payload: serializer.serialize(event.payload),
});

describe("EventStoreWithLoggerAdapter", () => {
  test("find - success", async () => {
    const finder = new EventFinderNoopAdapter([serialized(mocks.GenericHourHasPassedEvent)]);
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, finderLast, inserter, serializer });
    const Logger = new LoggerCollectingAdapter();
    const store = new EventStoreWithLoggerAdapter<PassageOfTimeEvent>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await store.find(registry, mocks.GenericHourHasPassedEvent.stream)).toEqual([
        mocks.GenericHourHasPassedEvent,
      ]);
    });

    expect(Logger.entries).toEqual([
      {
        message: "Event store find attempt",
        component: "infra",
        operation: "event_store",
        correlationId: mocks.correlationId,
        metadata: { stream: "passage_of_time", names: ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"] },
      },
      {
        message: "Event store find success",
        component: "infra",
        operation: "event_store",
        correlationId: mocks.correlationId,
        metadata: {
          stream: "passage_of_time",
          names: ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"],
          count: 1,
          duration: expect.any(tools.Duration),
        },
      },
    ]);
  });

  test("findLast - success", async () => {
    const finderLast = new EventFinderLastNoopAdapter(serialized(mocks.GenericHourHasPassedEvent));
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, finderLast, inserter, serializer });
    const Logger = new LoggerCollectingAdapter();
    const store = new EventStoreWithLoggerAdapter<PassageOfTimeEvent>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await store.findLast(registry, mocks.GenericHourHasPassedEvent.stream)).toEqual(
        mocks.GenericHourHasPassedEvent,
      );
    });

    expect(Logger.entries).toEqual([
      {
        message: "Event store find last attempt",
        component: "infra",
        operation: "event_store",
        correlationId: mocks.correlationId,
        metadata: { stream: "passage_of_time", names: ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"] },
      },
      {
        message: "Event store find last success",
        component: "infra",
        operation: "event_store",
        correlationId: mocks.correlationId,
        metadata: {
          stream: "passage_of_time",
          names: ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"],
          found: true,
          duration: expect.any(tools.Duration),
        },
      },
    ]);
  });

  test("findLast - no event", async () => {
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, finderLast, inserter, serializer });
    const Logger = new LoggerCollectingAdapter();
    const store = new EventStoreWithLoggerAdapter<PassageOfTimeEvent>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await store.findLast(registry, mocks.GenericHourHasPassedEvent.stream)).toEqual(null);
    });

    expect(Logger.entries).toEqual([
      {
        message: "Event store find last attempt",
        component: "infra",
        operation: "event_store",
        correlationId: mocks.correlationId,
        metadata: { stream: "passage_of_time", names: ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"] },
      },
      {
        message: "Event store find last success",
        component: "infra",
        operation: "event_store",
        correlationId: mocks.correlationId,
        metadata: {
          stream: "passage_of_time",
          names: ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"],
          found: false,
          duration: expect.any(tools.Duration),
        },
      },
    ]);
  });

  test("save - no events", async () => {
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, finderLast, inserter, serializer });
    const Logger = new LoggerCollectingAdapter();
    const store = new EventStoreWithLoggerAdapter<PassageOfTimeEvent>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () => expect(await store.save([])).toEqual([]));

    expect(Logger.entries).toEqual([
      {
        message: "Event store save attempt",
        component: "infra",
        operation: "event_store",
        correlationId: mocks.correlationId,
        metadata: { stream: undefined, names: [], count: 0 },
      },
      {
        message: "Event store save success",
        component: "infra",
        operation: "event_store",
        correlationId: mocks.correlationId,
        metadata: { stream: undefined, names: [], count: 0, duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("save - success", async () => {
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, finderLast, inserter, serializer });
    const Logger = new LoggerCollectingAdapter();
    const store = new EventStoreWithLoggerAdapter<PassageOfTimeEvent>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await store.save([mocks.GenericHourHasPassedEvent])).toEqual([mocks.GenericHourHasPassedEvent]);
    });

    expect(Logger.entries).toEqual([
      {
        message: "Event store save attempt",
        component: "infra",
        operation: "event_store",
        correlationId: mocks.correlationId,
        metadata: { stream: "passage_of_time", names: ["HOUR_HAS_PASSED_EVENT"], count: 1 },
      },
      {
        message: "Event store save success",
        component: "infra",
        operation: "event_store",
        correlationId: mocks.correlationId,
        metadata: {
          stream: "passage_of_time",
          names: ["HOUR_HAS_PASSED_EVENT"],
          count: 1,
          duration: expect.any(tools.Duration),
        },
      },
    ]);
  });

  test("save - failure", async () => {
    const inner = new EventStoreAdapter<PassageOfTimeEvent>({ finder, finderLast, inserter, serializer });
    const Logger = new LoggerCollectingAdapter();
    using _ = spyOn(inner, "save").mockImplementation(mocks.throwIntentionalErrorAsync);
    const store = new EventStoreWithLoggerAdapter<PassageOfTimeEvent>({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () => store.save([mocks.GenericHourHasPassedEvent])),
    ).toThrow(mocks.IntentionalError);
    expect(Logger.entries).toEqual([
      {
        message: "Event store save attempt",
        component: "infra",
        operation: "event_store",
        correlationId: mocks.correlationId,
        metadata: { stream: "passage_of_time", names: ["HOUR_HAS_PASSED_EVENT"], count: 1 },
      },
      {
        message: "Event store save error",
        component: "infra",
        operation: "event_store",
        correlationId: mocks.correlationId,
        error: new Error(mocks.IntentionalError),
        metadata: {
          stream: "passage_of_time",
          names: ["HOUR_HAS_PASSED_EVENT"],
          count: 1,
          duration: expect.any(tools.Duration),
        },
      },
    ]);
  });
});
