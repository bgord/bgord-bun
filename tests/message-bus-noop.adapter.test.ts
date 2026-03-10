import { describe, expect, jest, test } from "bun:test";
import { MessageBusNoopAdapter } from "../src/message-bus-noop.adapter";
import * as mocks from "./mocks";

describe("MessageBusNoopAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new MessageBusNoopAdapter<mocks.MessageType>();

    bus.on("TEST_MESSAGE", handler);
    await bus.emit(mocks.message);

    expect(handler).not.toHaveBeenCalled();
  });
});
