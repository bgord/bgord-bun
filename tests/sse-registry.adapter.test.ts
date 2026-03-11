import { describe, expect, jest, test } from "bun:test";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const HashContent = new HashContentSha256Strategy();
const deps = { HashContent };

const resolver = new SubjectRequestResolver([new SubjectSegmentUserStrategy()], deps);

describe("SseRegistryAdapter", async () => {
  const context = new RequestContextBuilder().withUserId(mocks.userId).build();
  const subject = await resolver.resolve(context);
  const anotherSubject = await resolver.resolve(
    new RequestContextBuilder().withUserId(mocks.anotherUserId).build(),
  );

  test("register", async () => {
    const sender = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(subject.hex.get(), sender);

    // @ts-expect-error Private property
    expect(registry.senders).toEqual(new Map().set(subject.hex.get(), new Set().add(sender)));
  });

  test("unregister", async () => {
    const sender = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(subject.hex.get(), sender);

    // @ts-expect-error Private property
    expect(registry.senders).toEqual(new Map().set(subject.hex.get(), new Set().add(sender)));

    registry.unregister(subject.hex.get(), sender);

    // @ts-expect-error Private property
    expect(registry.senders).toEqual(new Map().set(subject.hex.get(), new Set()));
  });

  test("unregister - unknown userId", async () => {
    const sender = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    expect(() => registry.unregister(subject.hex.get(), sender)).not.toThrow();
  });

  test("emit", async () => {
    const sender = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(subject.hex.get(), sender);
    await registry.emit(subject.hex.get(), mocks.message);

    expect(sender).toHaveBeenCalledWith(mocks.message);
  });

  test("emit - no sender", async () => {
    const sender = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    await registry.emit(subject.hex.get(), mocks.message);

    expect(sender).not.toHaveBeenCalled();
  });

  test("emits - multiple senders", async () => {
    const first = jest.fn();
    const second = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(subject.hex.get(), first);
    registry.register(subject.hex.get(), second);
    await registry.emit(subject.hex.get(), mocks.message);

    expect(first).toHaveBeenCalledWith(mocks.message);
    expect(second).toHaveBeenCalledWith(mocks.message);
  });

  test("emits - no intersection", async () => {
    const sender = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(anotherSubject.hex.get(), sender);
    await registry.emit(subject.hex.get(), mocks.message);

    expect(sender).not.toHaveBeenCalled();
  });
});
