import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { MessageBusEmitteryAdapter } from "../src/message-bus-emittery.adapter";
import { MessageBusWithLoggerAdapter } from "../src/message-bus-with-logger.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("MessageBusWithLoggerAdapter", () => {
  test("emit", async () => {
    const handler = jest.fn();
    const Logger = new LoggerCollectingAdapter();
    const inner = new MessageBusEmitteryAdapter<mocks.MessageType>();
    const bus = new MessageBusWithLoggerAdapter<mocks.MessageType>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      bus.on("TEST_MESSAGE", handler);
      await bus.emit(mocks.message);
      await bus.emit(mocks.message);
    });

    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "message_bus",
        message: "Message bus emit attempt",
        correlationId: mocks.correlationId,
        metadata: { message: mocks.message },
      },
      {
        component: "infra",
        operation: "message_bus",
        message: "Message bus emit success",
        correlationId: mocks.correlationId,
        metadata: { message: mocks.message, duration: expect.any(tools.Duration) },
      },
      {
        component: "infra",
        operation: "message_bus",
        message: "Message bus emit attempt",
        correlationId: mocks.correlationId,
        metadata: { message: mocks.message },
      },
      {
        component: "infra",
        operation: "message_bus",
        message: "Message bus emit success",
        correlationId: mocks.correlationId,
        metadata: { message: mocks.message, duration: expect.any(tools.Duration) },
      },
    ]);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  test("emit - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new MessageBusEmitteryAdapter<mocks.MessageType>();
    using _ = spyOn(inner, "emit").mockImplementation(mocks.throwIntentionalErrorAsync);
    const bus = new MessageBusWithLoggerAdapter<mocks.MessageType>({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () => bus.emit(mocks.message)),
    ).toThrow(mocks.IntentionalError);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "message_bus",
        message: "Message bus emit attempt",
        correlationId: mocks.correlationId,
        metadata: { message: mocks.message },
      },
      {
        component: "infra",
        operation: "message_bus",
        message: "Message bus emit error",
        correlationId: mocks.correlationId,
        error: new Error(mocks.IntentionalError),
        metadata: { message: mocks.message, duration: expect.any(tools.Duration) },
      },
    ]);
  });
});
