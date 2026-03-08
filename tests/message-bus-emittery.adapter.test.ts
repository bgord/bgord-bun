import { describe, expect, jest, test } from "bun:test";
import { MessageBusEmitteryAdapter } from "../src/message-bus-emittery.adapter";
import * as mocks from "./mocks";

type MessageType = { name: "TEST_MESSAGE" };
const message = { name: "TEST_MESSAGE" } as const;

describe("MessageBusEmitteryAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new MessageBusEmitteryAdapter<MessageType>();

    bus.on("TEST_MESSAGE", handler);
    await bus.emit(message);

    expect(handler).toHaveBeenCalledWith(message);
  });

  test("error propagation - sync", async () => {
    const bus = new MessageBusEmitteryAdapter<MessageType>();

    bus.on("TEST_MESSAGE", mocks.throwIntentionalError);

    expect(async () => bus.emit(message)).toThrow(mocks.IntentionalError);
  });

  test("error propagation - async", async () => {
    const bus = new MessageBusEmitteryAdapter<MessageType>();

    bus.on("TEST_MESSAGE", mocks.throwIntentionalErrorAsync);

    expect(async () => bus.emit(message)).toThrow(mocks.IntentionalError);
  });
});
