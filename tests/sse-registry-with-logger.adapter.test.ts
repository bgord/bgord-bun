import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import { SseRegistryWithLimitAdapter } from "../src/sse-registry-with-limit.adapter";
import { SseRegistryWithLoggerAdapter } from "../src/sse-registry-with-logger.adapter";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

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
    const registry = new SseRegistryWithLoggerAdapter<mocks.MessageType>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () =>
      registry.register(subject.hex.get(), sender),
    );

    expect(Logger.entries).toEqual([
      {
        message: "SSE registry register attempt",
        metadata: { identity: subject.hex.get() },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
      {
        message: "SSE registry register success",
        metadata: {
          identity: subject.hex.get(),
          registered: true,
          duration: expect.any(tools.Duration),
        },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
    ]);
    expect(register).toHaveBeenCalledWith(subject.hex.get(), sender);
  });

  test("register - rejected", async () => {
    const limited = new SseRegistryWithLimitAdapter<mocks.MessageType>({
      inner: new SseRegistryAdapter<mocks.MessageType>(),
      limit: tools.Int.positive(1),
    });
    const Logger = new LoggerCollectingAdapter();
    const registry = new SseRegistryWithLoggerAdapter<mocks.MessageType>({ inner: limited, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () =>
      registry.register(subject.hex.get(), sender),
    );

    const rejected = await CorrelationStorage.run(mocks.correlationId, async () =>
      registry.register(subject.hex.get(), jest.fn()),
    );

    expect(rejected).toEqual(false);
    expect(Logger.entries[3]).toEqual({
      message: "SSE registry register success",
      metadata: {
        identity: subject.hex.get(),
        registered: false,
        duration: expect.any(tools.Duration),
      },
      correlationId: mocks.correlationId,
      component: "infra",
      operation: "sse_registry",
    });
  });

  test("unregister", async () => {
    using unregister = spyOn(inner, "unregister");
    const Logger = new LoggerCollectingAdapter();
    const registry = new SseRegistryWithLoggerAdapter<mocks.MessageType>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () =>
      registry.unregister(subject.hex.get(), sender),
    );

    expect(Logger.entries).toEqual([
      {
        message: "SSE registry unregister attempt",
        metadata: { identity: subject.hex.get() },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
      {
        message: "SSE registry unregister success",
        metadata: { identity: subject.hex.get(), duration: expect.any(tools.Duration) },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
    ]);
    expect(unregister).toHaveBeenCalledWith(subject.hex.get(), sender);
  });

  test("emit", async () => {
    using emit = spyOn(inner, "emit");
    const Logger = new LoggerCollectingAdapter();
    const registry = new SseRegistryWithLoggerAdapter<mocks.MessageType>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () =>
      registry.emit(subject.hex.get(), mocks.message),
    );

    expect(Logger.entries).toEqual([
      {
        message: "SSE registry emit attempt",
        metadata: { identity: subject.hex.get(), message: mocks.message },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
      {
        message: "SSE registry emit success",
        metadata: {
          identity: subject.hex.get(),
          message: mocks.message,
          duration: expect.any(tools.Duration),
        },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
    ]);
    expect(emit).toHaveBeenCalledWith(subject.hex.get(), mocks.message);
  });

  test("emit - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    using _ = spyOn(inner, "emit").mockImplementation(mocks.throwIntentionalErrorAsync);
    const registry = new SseRegistryWithLoggerAdapter<mocks.MessageType>({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () =>
        registry.emit(subject.hex.get(), mocks.message),
      ),
    ).toThrow(mocks.IntentionalError);
    expect(Logger.entries).toEqual([
      {
        message: "SSE registry emit attempt",
        metadata: { identity: subject.hex.get(), message: mocks.message },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
      {
        message: "SSE registry emit error",
        error: new Error(mocks.IntentionalError),
        metadata: {
          identity: subject.hex.get(),
          message: mocks.message,
          duration: expect.any(tools.Duration),
        },
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "sse_registry",
      },
    ]);
  });

  test("count", async () => {
    const Logger = new LoggerCollectingAdapter();
    const registry = new SseRegistryWithLoggerAdapter<mocks.MessageType>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () =>
      registry.register(subject.hex.get(), sender),
    );

    expect(registry.count(subject.hex.get())).toEqual(1);

    await CorrelationStorage.run(mocks.correlationId, async () =>
      registry.unregister(subject.hex.get(), sender),
    );

    expect(registry.count(subject.hex.get())).toEqual(0);
  });
});
