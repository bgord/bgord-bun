import { describe, expect, jest, test } from "bun:test";
import { MessageBusEmitteryAdapter } from "../src/message-bus-emittery.adapter";
import * as mocks from "./mocks";

describe("MessageBusEmitteryAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new MessageBusEmitteryAdapter<mocks.MessageType>();

    bus.on("TEST_MESSAGE", handler);
    await bus.emit(mocks.message);

    expect(handler).toHaveBeenCalledWith(mocks.message);
  });

  test("error propagation - sync", async () => {
    const bus = new MessageBusEmitteryAdapter<mocks.MessageType>();

    bus.on("TEST_MESSAGE", mocks.throwIntentionalError);

    expect(async () => bus.emit(mocks.message)).toThrow(mocks.IntentionalError);
  });

  test("error propagation - async", async () => {
    const bus = new MessageBusEmitteryAdapter<mocks.MessageType>();

    bus.on("TEST_MESSAGE", mocks.throwIntentionalErrorAsync);

    expect(async () => bus.emit(mocks.message)).toThrow(mocks.IntentionalError);
  });
});
