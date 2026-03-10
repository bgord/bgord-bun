import { describe, expect, spyOn, test } from "bun:test";
import { SseConnectionNoopAdapter } from "../src/sse-connection-noop.adapter";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import * as mocks from "./mocks";

const connection = new SseConnectionNoopAdapter<mocks.MessageType>();

describe("SseRegistryAdapter", () => {
  test("register", async () => {
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(mocks.userId, connection);

    // @ts-expect-error Private property
    expect(registry.connections).toEqual(new Map().set(mocks.userId, new Set().add(connection)));
  });

  test("unregister", async () => {
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(mocks.userId, connection);

    // @ts-expect-error Private property
    expect(registry.connections).toEqual(new Map().set(mocks.userId, new Set().add(connection)));

    registry.unregister(mocks.userId, connection);

    // @ts-expect-error Private property
    expect(registry.connections).toEqual(new Map().set(mocks.userId, new Set()));
  });

  test("unregister - unknown userId", async () => {
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    expect(() => registry.unregister(mocks.userId, connection)).not.toThrow();
  });

  test("emit", async () => {
    using send = spyOn(connection, "send");
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(mocks.userId, connection);
    await registry.emit(mocks.userId, mocks.message);

    expect(send).toHaveBeenCalledWith(mocks.message);
  });

  test("emit - no connection", async () => {
    using send = spyOn(connection, "send");
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    await registry.emit(mocks.userId, mocks.message);

    expect(send).not.toHaveBeenCalled();
  });

  test("emits - multiple connections", async () => {
    const first = new SseConnectionNoopAdapter<mocks.MessageType>();
    const second = new SseConnectionNoopAdapter<mocks.MessageType>();
    using sendFirst = spyOn(first, "send");
    using sendSecond = spyOn(second, "send");
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(mocks.userId, first);
    registry.register(mocks.userId, second);
    await registry.emit(mocks.userId, mocks.message);

    expect(sendFirst).toHaveBeenCalledWith(mocks.message);
    expect(sendSecond).toHaveBeenCalledWith(mocks.message);
  });

  test("emits - no intersection", async () => {
    using send = spyOn(connection, "send");
    const registry = new SseRegistryAdapter<mocks.MessageType>();

    registry.register(mocks.anotherUserId, connection);
    await registry.emit(mocks.userId, mocks.message);

    expect(send).not.toHaveBeenCalled();
  });
});
