import { describe, expect, jest, test } from "bun:test";
import { SseRegistryCollectingAdapter } from "../src/sse-registry-collecting.adapter";

type MessageType = { name: "TEST_MESSAGE" };
const message = { name: "TEST_MESSAGE" } as const;
const userId = "user-1";

describe("SseRegistryCollectingAdapter", () => {
  test("emit", async () => {
    const registry = new SseRegistryCollectingAdapter<MessageType>();

    await registry.emit(userId, message);

    expect(registry.emitted).toEqual([{ userId, message }]);
  });

  test("register", async () => {
    const send = jest.fn();
    const connection = { send, close: jest.fn(), onClose: jest.fn() };
    const registry = new SseRegistryCollectingAdapter<MessageType>();

    registry.register(userId, connection);
    await registry.emit(userId, message);

    expect(send).not.toHaveBeenCalled();
  });
});
