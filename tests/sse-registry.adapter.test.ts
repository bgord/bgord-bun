import { describe, expect, jest, test } from "bun:test";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import * as mocks from "./mocks";

describe("SseRegistryAdapter", () => {
  test("register", async () => {
    const sender = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(mocks.userId, sender);

    // @ts-expect-error Private property
    expect(registry.senders).toEqual(new Map().set(mocks.userId, new Set().add(sender)));
  });

  test("unregister", async () => {
    const sender = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(mocks.userId, sender);

    // @ts-expect-error Private property
    expect(registry.senders).toEqual(new Map().set(mocks.userId, new Set().add(sender)));

    registry.unregister(mocks.userId, sender);

    // @ts-expect-error Private property
    expect(registry.senders).toEqual(new Map().set(mocks.userId, new Set()));
  });

  test("unregister - unknown userId", async () => {
    const sender = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    expect(() => registry.unregister(mocks.userId, sender)).not.toThrow();
  });

  test("emit", async () => {
    const sender = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(mocks.userId, sender);
    await registry.emit(mocks.userId, mocks.message);

    expect(sender).toHaveBeenCalledWith(mocks.message);
  });

  test("emit - no sender", async () => {
    const sender = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    await registry.emit(mocks.userId, mocks.message);

    expect(sender).not.toHaveBeenCalled();
  });

  test("emits - multiple senders", async () => {
    const first = jest.fn();
    const second = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(mocks.userId, first);
    registry.register(mocks.userId, second);
    await registry.emit(mocks.userId, mocks.message);

    expect(first).toHaveBeenCalledWith(mocks.message);
    expect(second).toHaveBeenCalledWith(mocks.message);
  });

  test("emits - no intersection", async () => {
    const sender = jest.fn();
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(mocks.anotherUserId, sender);
    await registry.emit(mocks.userId, mocks.message);

    expect(sender).not.toHaveBeenCalled();
  });
});
