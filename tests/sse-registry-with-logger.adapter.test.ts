import { describe, expect, jest, spyOn, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import { SseRegistryWithLoggerAdapter } from "../src/sse-registry-with-logger.adapter";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const HashContent = new HashContentSha256Strategy();
const deps = { HashContent };

const resolver = new SubjectRequestResolver([new SubjectSegmentUserStrategy()], deps);
const inner = new SseRegistryAdapter<mocks.MessageType>();
const sender = jest.fn();

describe("SseRegistryWithLoggerAdapter", async () => {
  const context = new RequestContextBuilder().withUserId(mocks.userId).build();
  const subject = await resolver.resolve(context);

  test("register", async () => {
    using register = spyOn(inner, "register");
    const Logger = new LoggerCollectingAdapter();
    const registry = new SseRegistryWithLoggerAdapter<mocks.MessageType>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      registry.register(subject.hex, sender);
    });

    expect(Logger.entries).toEqual([
      {
        message: "SSE sender registered",
        metadata: { identity: subject.hex },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
    ]);
    expect(register).toHaveBeenCalledWith(subject.hex, sender);
  });

  test("unregister", async () => {
    using unregister = spyOn(inner, "unregister");
    const Logger = new LoggerCollectingAdapter();
    const registry = new SseRegistryWithLoggerAdapter<mocks.MessageType>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      registry.unregister(subject.hex, sender);
    });

    expect(Logger.entries).toEqual([
      {
        message: "SSE sender unregistered",
        metadata: { identity: subject.hex },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
    ]);
    expect(unregister).toHaveBeenCalledWith(subject.hex, sender);
  });

  test("emit", async () => {
    using emit = spyOn(inner, "emit");
    const Logger = new LoggerCollectingAdapter();
    const registry = new SseRegistryWithLoggerAdapter<mocks.MessageType>({ inner, Logger });

    await CorrelationStorage.run(mocks.correlationId, async () => {
      await registry.emit(subject.hex, mocks.message);
    });

    expect(Logger.entries).toEqual([
      {
        message: "TEST_MESSAGE emitted",
        metadata: { identity: subject.hex, message: mocks.message },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
    ]);
    expect(emit).toHaveBeenCalledWith(subject.hex, mocks.message);
  });
});
