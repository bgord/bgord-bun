import { describe, expect, jest, spyOn, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import { SseRegistryWithLoggerAdapter } from "../src/sse-registry-with-logger.adapter";
import * as mocks from "./mocks";

const sender = jest.fn();
const inner = new SseRegistryAdapter<mocks.MessageType>();

describe("SseRegistryWithLoggerAdapter", () => {
  test("register", async () => {
    using register = spyOn(inner, "register");
    const Logger = new LoggerCollectingAdapter();
    const registry = new SseRegistryWithLoggerAdapter<mocks.MessageType>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      registry.register(mocks.userId, sender);
    });

    expect(Logger.entries).toEqual([
      {
        message: "SSE sender registered",
        metadata: { userId: mocks.userId },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
    ]);
    expect(register).toHaveBeenCalledWith(mocks.userId, sender);
  });

  test("unregister", async () => {
    using unregister = spyOn(inner, "unregister");
    const Logger = new LoggerCollectingAdapter();
    const registry = new SseRegistryWithLoggerAdapter<mocks.MessageType>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      registry.unregister(mocks.userId, sender);
    });

    expect(Logger.entries).toEqual([
      {
        message: "SSE sender unregistered",
        metadata: { userId: mocks.userId },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
    ]);
    expect(unregister).toHaveBeenCalledWith(mocks.userId, sender);
  });

  test("emit", async () => {
    using emit = spyOn(inner, "emit");
    const Logger = new LoggerCollectingAdapter();
    const registry = new SseRegistryWithLoggerAdapter<mocks.MessageType>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      await registry.emit(mocks.userId, mocks.message);
    });

    expect(Logger.entries).toEqual([
      {
        message: "TEST_MESSAGE emitted",
        metadata: { userId: mocks.userId, message: mocks.message },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
    ]);
    expect(emit).toHaveBeenCalledWith(mocks.userId, mocks.message);
  });
});
