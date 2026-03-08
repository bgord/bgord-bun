import { describe, expect, jest, test } from "bun:test";
import { MessageBusNoopAdapter } from "../src/message-bus-noop.adapter";

type MessageType = { name: "TEST_MESSAGE" };
const message = { name: "TEST_MESSAGE" } as const;

describe("MessageBusNoopAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new MessageBusNoopAdapter<MessageType>();

    bus.on("TEST_MESSAGE", handler);
    await bus.emit(message);

    expect(handler).not.toHaveBeenCalled();
  });
});
