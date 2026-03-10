import { describe, expect, jest, test } from "bun:test";
import { SseRegistryNoopAdapter } from "../src/sse-registry-noop.adapter";

type MessageType = { name: "TEST_MESSAGE" };
const message = { name: "TEST_MESSAGE" } as const;
const userId = "user-1";

describe("SseRegistryNoopAdapter", () => {
  test("happy path", async () => {
    // TODO use SSE connection noop
    const send = jest.fn();
    const connection = { send, close: jest.fn(), onClose: jest.fn() };
    const registry = new SseRegistryNoopAdapter<MessageType>();

    registry.register(userId, connection);
    await registry.emit(userId, message);

    expect(send).not.toHaveBeenCalled();
  });
});
