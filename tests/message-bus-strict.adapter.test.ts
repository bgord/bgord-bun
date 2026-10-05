import { describe, expect, jest, spyOn, test } from "bun:test";
import { MessageBusEmitteryAdapter } from "../src/message-bus-emittery.adapter";
import { MessageBusStrictAdapter } from "../src/message-bus-strict.adapter";
import * as mocks from "./mocks";

describe("MessageBusStrictAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const inner = new MessageBusEmitteryAdapter<mocks.MessageType>();
    const bus = new MessageBusStrictAdapter<mocks.MessageType>({ inner });
    bus.on("TEST_MESSAGE", handler);

    await bus.emit(mocks.message);

    expect(handler).toHaveBeenCalledWith(mocks.message);
  });

  test("happy path - different names", async () => {
    const handler = jest.fn();
    const anotherHandler = jest.fn();
    const inner = new MessageBusEmitteryAdapter<mocks.MessageType | mocks.AnotherMessageType>();
    const bus = new MessageBusStrictAdapter<mocks.MessageType | mocks.AnotherMessageType>({ inner });
    bus.on("TEST_MESSAGE", handler);
    bus.on("ANOTHER_MESSAGE", anotherHandler);

    await bus.emit(mocks.message);
    await bus.emit(mocks.anotherMessage);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(mocks.message);
    expect(anotherHandler).toHaveBeenCalledTimes(1);
    expect(anotherHandler).toHaveBeenCalledWith(mocks.anotherMessage);
  });

  test("no handler", async () => {
    const inner = new MessageBusEmitteryAdapter<mocks.MessageType>();
    using innerEmit = spyOn(inner, "emit");
    const bus = new MessageBusStrictAdapter<mocks.MessageType>({ inner });

    expect(async () => bus.emit(mocks.message)).toThrow("message.bus.strict.adapter.no.handler");
    expect(innerEmit).not.toHaveBeenCalled();
  });

  test("no handler - another name registered", async () => {
    const inner = new MessageBusEmitteryAdapter<mocks.MessageType | mocks.AnotherMessageType>();
    const bus = new MessageBusStrictAdapter<mocks.MessageType | mocks.AnotherMessageType>({ inner });
    bus.on("ANOTHER_MESSAGE", jest.fn());

    expect(async () => bus.emit(mocks.message)).toThrow("message.bus.strict.adapter.no.handler");
  });

  test("duplicate handler", () => {
    const handler = jest.fn();
    const inner = new MessageBusEmitteryAdapter<mocks.MessageType>();
    const bus = new MessageBusStrictAdapter<mocks.MessageType>({ inner });
    bus.on("TEST_MESSAGE", handler);

    expect(() => bus.on("TEST_MESSAGE", handler)).toThrow("message.bus.strict.adapter.duplicate.handler");
  });

  test("error propagation", async () => {
    const inner = new MessageBusEmitteryAdapter<mocks.MessageType>();
    const bus = new MessageBusStrictAdapter<mocks.MessageType>({ inner });
    bus.on("TEST_MESSAGE", mocks.throwIntentionalErrorAsync);

    expect(async () => bus.emit(mocks.message)).toThrow(mocks.IntentionalError);
  });
});
