import { describe, expect, spyOn, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SseConnectionNoopAdapter } from "../src/sse-connection-noop.adapter";
import { SseConnectionWithLoggerAdapter } from "../src/sse-connection-with-logger.adapter";
import * as mocks from "./mocks";

const inner = new SseConnectionNoopAdapter<mocks.MessageType>();
const callback = () => {};

describe("SseConnectionWithLoggerAdapter", () => {
  test("send", async () => {
    using innerSend = spyOn(inner, "send");
    const Logger = new LoggerCollectingAdapter();
    const connection = new SseConnectionWithLoggerAdapter<mocks.MessageType>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, async () => connection.send(mocks.message));

    expect(Logger.entries).toEqual([
      {
        message: "TEST_MESSAGE sent",
        metadata: mocks.message,
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_connection",
      },
    ]);
    expect(innerSend).toHaveBeenCalledWith(mocks.message);
  });

  test("close", async () => {
    using innerClose = spyOn(inner, "close");
    const Logger = new LoggerCollectingAdapter();
    const connection = new SseConnectionWithLoggerAdapter<mocks.MessageType>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, () => connection.close(callback));

    expect(Logger.entries).toEqual([
      {
        message: "SSE connection closed",
        metadata: {},
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_connection",
      },
    ]);
    expect(innerClose).toHaveBeenCalledWith(callback);
  });
});
