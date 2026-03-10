import { describe, expect, jest, test } from "bun:test";
import { MessageBusCollectingAdapter } from "../src/message-bus-collecting.adapter";
import * as mocks from "./mocks";

describe("MessageBusCollectingAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new MessageBusCollectingAdapter<mocks.MessageType>();

    bus.on("TEST_MESSAGE", handler);
    await bus.emit(mocks.message);

    expect(bus.messages).toEqual([mocks.message]);
    expect(handler).not.toHaveBeenCalled();
  });
});
