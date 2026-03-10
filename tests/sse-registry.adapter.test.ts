import { describe, expect, spyOn, test } from "bun:test";
import { SseConnectionNoopAdapter } from "../src/sse-connection-noop.adapter";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import * as mocks from "./mocks";

type MessageType = { name: "TEST_MESSAGE" };
const message = { name: "TEST_MESSAGE" } as const;

const connection = new SseConnectionNoopAdapter<MessageType>();

describe("SseRegistryAdapter", () => {
  test("register", async () => {
    const registry = new SseRegistryAdapter<MessageType>();

    registry.register(mocks.userId, connection);

    // @ts-expect-error Private property
    expect(registry.connections).toEqual(new Map().set(mocks.userId, new Set().add(connection)));
  });

  test("unregister", async () => {
    const registry = new SseRegistryAdapter<MessageType>();

    registry.register(mocks.userId, connection);

    // @ts-expect-error Private property
    expect(registry.connections).toEqual(new Map().set(mocks.userId, new Set().add(connection)));

    registry.unregister(mocks.userId, connection);

    // @ts-expect-error Private property
    expect(registry.connections).toEqual(new Map().set(mocks.userId, new Set()));
  });

  test("emit", async () => {
    using send = spyOn(connection, "send");
    const registry = new SseRegistryAdapter<MessageType>();

    registry.register(mocks.userId, connection);
    await registry.emit(mocks.userId, message);

    expect(send).toHaveBeenCalledWith(message);
  });

  test("emit - no connection", async () => {
    using send = spyOn(connection, "send");
    const registry = new SseRegistryAdapter<MessageType>();

    await registry.emit(mocks.userId, message);

    expect(send).not.toHaveBeenCalled();
  });

  test("emits - multiple connections", async () => {
    const first = new SseConnectionNoopAdapter<MessageType>();
    const second = new SseConnectionNoopAdapter<MessageType>();
    using sendFirst = spyOn(first, "send");
    using sendSecond = spyOn(second, "send");
    const registry = new SseRegistryAdapter<MessageType>();

    registry.register(mocks.userId, first);
    registry.register(mocks.userId, second);
    await registry.emit(mocks.userId, message);

    expect(sendFirst).toHaveBeenCalledWith(message);
    expect(sendSecond).toHaveBeenCalledWith(message);
  });

  test("emits - no intersection", async () => {
    using send = spyOn(connection, "send");
    const registry = new SseRegistryAdapter<MessageType>();

    registry.register(mocks.anotherUserId, connection);
    await registry.emit(mocks.userId, message);

    expect(send).not.toHaveBeenCalled();
  });
});
