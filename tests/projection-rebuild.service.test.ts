import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventEnvelopeSchema } from "../src/event-envelope";
import { EventLogReaderMemoryAdapter } from "../src/event-log-reader-memory.adapter";
import { EventUpcasterChainAdapter } from "../src/event-upcaster-chain.adapter";
import { EventUpcasterStep } from "../src/event-upcaster-step.vo";
import { EventValidatorRegistryAdapter } from "../src/event-validator-registry.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { EventBusCollectingAdapter } from "../src/message-bus-collecting.adapter";
import { EventBusEmitteryAdapter } from "../src/message-bus-emittery.adapter";
import * as System from "../src/modules/system";
import { PayloadSerializerJsonAdapter } from "../src/payload-serializer-json.adapter";
import { ProjectionRebuild } from "../src/projection-rebuild.service";
import * as mocks from "./mocks";

type PassageOfTimeEvent = System.Events.HourHasPassedEventType | System.Events.MinuteHasPassedEventType;

const registry = new EventValidatorRegistryAdapter<PassageOfTimeEvent>({
  [System.Events.HOUR_HAS_PASSED_EVENT]: System.Events.HourHasPassedEvent,
  [System.Events.MINUTE_HAS_PASSED_EVENT]: System.Events.MinuteHasPassedEvent,
});
const serializer = new PayloadSerializerJsonAdapter();
const config = { batch: tools.Int.positive(1) };

const HourHasPassedEventV2 = v.object({
  ...EventEnvelopeSchema,
  version: v.literal(2),
  name: v.literal(System.Events.HOUR_HAS_PASSED_EVENT),
  payload: v.object({ timestamp: tools.TimestampValue, source: v.string() }),
});

type HourHasPassedEventV2Type = v.InferOutput<typeof HourHasPassedEventV2>;

const upcaster = new EventUpcasterChainAdapter({
  HOUR_HAS_PASSED_EVENT: [
    new EventUpcasterStep<System.Events.HourHasPassedEventType, HourHasPassedEventV2Type>({
      fromVersion: 1,
      toVersion: 2,
      upcast: (payload) => ({ ...payload, source: "system" }),
    }),
  ],
});

describe("ProjectionRebuild", () => {
  test("happy path", async () => {
    jest.useRealTimers();
    const calls: Array<string> = [];
    const received: Array<PassageOfTimeEvent> = [];
    const EventLogReader = new EventLogReaderMemoryAdapter([
      { ...mocks.GenericMinuteHasPassedEventLogEntry, correlationId: mocks.anotherCorrelationId },
      mocks.GenericHourHasPassedEventLogEntry,
    ]);
    using read = spyOn(EventLogReader, "read");
    const EventBus = new EventBusEmitteryAdapter<PassageOfTimeEvent>();
    EventBus.on("HOUR_HAS_PASSED_EVENT", async (event) => {
      calls.push(`HOUR_HAS_PASSED_EVENT start ${CorrelationStorage.get()}`);
      await new Promise((resolve) => setTimeout(resolve, 1));
      received.push(event);
      calls.push("HOUR_HAS_PASSED_EVENT end");
    });
    EventBus.on("MINUTE_HAS_PASSED_EVENT", async (event) => {
      calls.push(`MINUTE_HAS_PASSED_EVENT start ${CorrelationStorage.get()}`);
      await new Promise((resolve) => setTimeout(resolve, 1));
      received.push(event);
      calls.push("MINUTE_HAS_PASSED_EVENT end");
    });
    const Logger = new LoggerCollectingAdapter();
    const rebuild = new ProjectionRebuild(config, {
      EventLogReader,
      EventBus,
      registry,
      serializer,
      transaction: async (fn) => {
        calls.push("transaction start");
        await fn();
        calls.push("transaction end");
      },
      clear: async () => {
        calls.push("clear");
      },
      Logger,
    });

    await rebuild.run();

    expect(calls).toEqual([
      "transaction start",
      "clear",
      `HOUR_HAS_PASSED_EVENT start ${mocks.correlationId}`,
      "HOUR_HAS_PASSED_EVENT end",
      `MINUTE_HAS_PASSED_EVENT start ${mocks.anotherCorrelationId}`,
      "MINUTE_HAS_PASSED_EVENT end",
      "transaction end",
    ]);
    expect(received).toEqual([
      mocks.GenericHourHasPassedEvent,
      { ...mocks.GenericMinuteHasPassedEvent, correlationId: mocks.anotherCorrelationId },
    ]);
    expect(read.mock.calls).toEqual([
      [{ names: ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"], after: 0, limit: 1 }],
      [{ names: ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"], after: 1, limit: 1 }],
      [{ names: ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"], after: 2, limit: 1 }],
    ]);
    expect(Logger.entries).toEqual([]);
  });

  test("happy path - no events", async () => {
    const calls: Array<string> = [];
    const EventLogReader = new EventLogReaderMemoryAdapter([]);
    const EventBus = new EventBusCollectingAdapter<PassageOfTimeEvent>();
    const Logger = new LoggerCollectingAdapter();
    const rebuild = new ProjectionRebuild(config, {
      EventLogReader,
      EventBus,
      registry,
      serializer,
      transaction: async (fn) => {
        calls.push("transaction start");
        await fn();
        calls.push("transaction end");
      },
      clear: async () => {
        calls.push("clear");
      },
      Logger,
    });

    await rebuild.run();

    expect(calls).toEqual(["transaction start", "clear", "transaction end"]);
    expect(EventBus.messages).toEqual([]);
  });

  test("happy path - last page full", async () => {
    const EventLogReader = new EventLogReaderMemoryAdapter([
      mocks.GenericHourHasPassedEventLogEntry,
      mocks.GenericMinuteHasPassedEventLogEntry,
    ]);
    using read = spyOn(EventLogReader, "read");
    const EventBus = new EventBusCollectingAdapter<PassageOfTimeEvent>();
    const Logger = new LoggerCollectingAdapter();
    const rebuild = new ProjectionRebuild(
      { batch: tools.Int.positive(2) },
      {
        EventLogReader,
        EventBus,
        registry,
        serializer,
        transaction: mocks.transaction,
        clear: async () => {},
        Logger,
      },
    );

    await rebuild.run();

    expect(EventBus.messages).toEqual([mocks.GenericHourHasPassedEvent, mocks.GenericMinuteHasPassedEvent]);
    expect(read.mock.calls).toEqual([
      [{ names: ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"], after: 0, limit: 2 }],
      [{ names: ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"], after: 2, limit: 2 }],
    ]);
  });

  test("happy path - upcaster", async () => {
    const registry = new EventValidatorRegistryAdapter<HourHasPassedEventV2Type>({
      [System.Events.HOUR_HAS_PASSED_EVENT]: HourHasPassedEventV2,
    });
    const EventLogReader = new EventLogReaderMemoryAdapter([mocks.GenericHourHasPassedEventLogEntry]);
    const EventBus = new EventBusCollectingAdapter<HourHasPassedEventV2Type>();
    const Logger = new LoggerCollectingAdapter();
    const rebuild = new ProjectionRebuild(config, {
      EventLogReader,
      EventBus,
      registry,
      serializer,
      upcaster,
      transaction: mocks.transaction,
      clear: async () => {},
      Logger,
    });

    await rebuild.run();

    expect(EventBus.messages).toEqual([
      {
        ...mocks.GenericHourHasPassedEvent,
        version: 2,
        payload: { ...mocks.GenericHourHasPassedEvent.payload, source: "system" },
      },
    ]);
  });

  test("happy path - outside the registry", async () => {
    const registry = new EventValidatorRegistryAdapter<System.Events.MinuteHasPassedEventType>({
      [System.Events.MINUTE_HAS_PASSED_EVENT]: System.Events.MinuteHasPassedEvent,
    });
    const EventLogReader = new EventLogReaderMemoryAdapter([
      mocks.GenericHourHasPassedEventLogEntry,
      mocks.GenericMinuteHasPassedEventLogEntry,
    ]);
    const EventBus = new EventBusCollectingAdapter<System.Events.MinuteHasPassedEventType>();
    const Logger = new LoggerCollectingAdapter();
    const rebuild = new ProjectionRebuild(config, {
      EventLogReader,
      EventBus,
      registry,
      serializer,
      transaction: mocks.transaction,
      clear: async () => {},
      Logger,
    });

    await rebuild.run();

    expect(EventBus.messages).toEqual([mocks.GenericMinuteHasPassedEvent]);
  });

  test("handler failure", async () => {
    const calls: Array<string> = [];
    const EventLogReader = new EventLogReaderMemoryAdapter([
      mocks.GenericHourHasPassedEventLogEntry,
      mocks.GenericMinuteHasPassedEventLogEntry,
    ]);
    const EventBus = new EventBusEmitteryAdapter<PassageOfTimeEvent>();
    EventBus.on("HOUR_HAS_PASSED_EVENT", mocks.throwIntentionalErrorAsync);
    EventBus.on("MINUTE_HAS_PASSED_EVENT", async () => {
      calls.push("MINUTE_HAS_PASSED_EVENT");
    });
    const Logger = new LoggerCollectingAdapter();
    const rebuild = new ProjectionRebuild(config, {
      EventLogReader,
      EventBus,
      registry,
      serializer,
      transaction: mocks.transaction,
      clear: async () => {},
      Logger,
    });

    expect(async () => rebuild.run()).toThrow(mocks.IntentionalError);

    expect(calls).toEqual([]);
    expect(Logger.entries).toEqual([
      {
        message: "Projection rebuild error",
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "projection_rebuild",
        metadata: { position: 1, id: mocks.GenericHourHasPassedEvent.id, name: "HOUR_HAS_PASSED_EVENT" },
        error: new Error(mocks.IntentionalError),
      },
    ]);
  });

  test("validation failure", async () => {
    const EventLogReader = new EventLogReaderMemoryAdapter([
      { ...mocks.GenericHourHasPassedEventLogEntry, payload: JSON.stringify({ timestamp: "invalid" }) },
    ]);
    const EventBus = new EventBusCollectingAdapter<PassageOfTimeEvent>();
    const Logger = new LoggerCollectingAdapter();
    const rebuild = new ProjectionRebuild(config, {
      EventLogReader,
      EventBus,
      registry,
      serializer,
      transaction: mocks.transaction,
      clear: async () => {},
      Logger,
    });

    expect(async () => rebuild.run()).toThrow();

    expect(EventBus.messages).toEqual([]);
    expect(Logger.entries).toEqual([
      {
        message: "Projection rebuild error",
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "projection_rebuild",
        metadata: { position: 1, id: mocks.GenericHourHasPassedEvent.id, name: "HOUR_HAS_PASSED_EVENT" },
        error: expect.any(Error),
      },
    ]);
  });

  test("deserialization failure", async () => {
    const EventLogReader = new EventLogReaderMemoryAdapter([
      { ...mocks.GenericHourHasPassedEventLogEntry, payload: "{" },
    ]);
    const EventBus = new EventBusCollectingAdapter<PassageOfTimeEvent>();
    const Logger = new LoggerCollectingAdapter();
    const rebuild = new ProjectionRebuild(config, {
      EventLogReader,
      EventBus,
      registry,
      serializer,
      transaction: mocks.transaction,
      clear: async () => {},
      Logger,
    });

    expect(async () => rebuild.run()).toThrow();

    expect(EventBus.messages).toEqual([]);
    expect(Logger.entries).toEqual([
      {
        message: "Projection rebuild error",
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "projection_rebuild",
        metadata: { position: 1, id: mocks.GenericHourHasPassedEvent.id, name: "HOUR_HAS_PASSED_EVENT" },
        error: expect.any(Error),
      },
    ]);
  });
});
