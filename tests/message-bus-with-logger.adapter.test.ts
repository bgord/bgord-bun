import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { MessageBusEmitteryAdapter } from "../src/message-bus-emittery.adapter";
import { MessageBusWithLoggerAdapter } from "../src/message-bus-with-logger.adapter";
import * as mocks from "./mocks";

type MessageType = { name: "TEST_MESSAGE" };
const message = { name: "TEST_MESSAGE" } as const;

describe("MessageBusWithLoggerAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const Logger = new LoggerCollectingAdapter();
    const inner = new MessageBusEmitteryAdapter<MessageType>();
    const bus = new MessageBusWithLoggerAdapter<MessageType>(inner, { Logger });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      bus.on("TEST_MESSAGE", handler);
      await bus.emit(message);
      await bus.emit(message);
    });

    expect(Logger.entries).toEqual(
      tools.repeat(
        {
          message: "TEST_MESSAGE emitted",
          correlationId: mocks.correlationId,
          component: "infra",
          operation: "message_bus_emit",
          metadata: message,
        },
        2,
      ),
    );
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
