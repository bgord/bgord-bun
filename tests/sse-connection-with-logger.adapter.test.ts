import { describe, expect, spyOn, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SseConnectionNoopAdapter } from "../src/sse-connection-noop.adapter";
import { SseConnectionWithLoggerAdapter } from "../src/sse-connection-with-logger.adapter";
import * as mocks from "./mocks";

type MessageType = { name: "TEST_MESSAGE" };
const message = { name: "TEST_MESSAGE" } as const;

const inner = new SseConnectionNoopAdapter<MessageType>();

describe("SseConnectionWithLoggerAdapter", () => {
  test("send", async () => {
    using send = spyOn(inner, "send");
    const Logger = new LoggerCollectingAdapter();
    const connection = new SseConnectionWithLoggerAdapter<MessageType>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, async () => connection.send(message));

    expect(Logger.entries).toEqual([
      {
        message: "TEST_MESSAGE sent",
        metadata: message,
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_connection",
      },
    ]);
    expect(send).toHaveBeenCalledWith(message);
  });

  test("close", async () => {
    using close = spyOn(inner, "close");
    const Logger = new LoggerCollectingAdapter();
    const connection = new SseConnectionWithLoggerAdapter<MessageType>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, () => connection.close());

    expect(Logger.entries).toEqual([
      {
        message: "sse_connection_closed",
        metadata: {},
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_connection",
      },
    ]);
    expect(close).toHaveBeenCalled();
  });

  test("onClose", async () => {
    using onClose = spyOn(inner, "onClose");
    const Logger = new LoggerCollectingAdapter();
    const connection = new SseConnectionWithLoggerAdapter<MessageType>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, () => connection.onClose(() => {}));

    expect(Logger.entries).toEqual([]);
    expect(onClose).toHaveBeenCalled();
  });
});
