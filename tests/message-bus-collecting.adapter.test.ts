import { describe, expect, jest, test } from "bun:test";
import { MessageBusCollectingAdapter } from "../src/message-bus-collecting.adapter";

type MessageType = { name: "TEST_MESSAGE" };
const message = { name: "TEST_MESSAGE" } as const;

describe("MessageBusCollectingAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new MessageBusCollectingAdapter<MessageType>();

    bus.on("TEST_MESSAGE", handler);
    await bus.emit(message);

    expect(bus.messages).toEqual([message]);
    expect(handler).not.toHaveBeenCalled();
  });
});
