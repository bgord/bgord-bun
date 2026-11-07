import { describe, expect, jest, test } from "bun:test";
import { MessageBusInMemoryAdapter } from "../src/message-bus-in-memory.adapter";
import * as mocks from "./mocks";

describe("MessageBusInMemoryAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new MessageBusInMemoryAdapter<mocks.MessageType>();
    bus.on("TEST_MESSAGE", handler);

    await bus.emit(mocks.message);

    expect(handler).toHaveBeenCalledWith(mocks.message);
  });

  test("happy path - no handlers", async () => {
    const bus = new MessageBusInMemoryAdapter<mocks.MessageType>();

    const result = await bus.emit(mocks.message);

    expect(result).toBeUndefined();
  });

  test("happy path - other message", async () => {
    const handler = jest.fn();
    const bus = new MessageBusInMemoryAdapter<mocks.MessageType | mocks.AnotherMessageType>();
    bus.on("ANOTHER_MESSAGE", handler);

    await bus.emit(mocks.message);

    expect(handler).not.toHaveBeenCalled();
  });

  test("happy path - handlers in registration order", async () => {
    const calls: Array<string> = [];
    const bus = new MessageBusInMemoryAdapter<mocks.MessageType>();
    bus.on("TEST_MESSAGE", () => {
      calls.push("first");
    });
    bus.on("TEST_MESSAGE", () => {
      calls.push("second");
    });

    await bus.emit(mocks.message);

    expect(calls).toEqual(["first", "second"]);
  });

  test("happy path - handlers run serially", async () => {
    const calls: Array<string> = [];
    const bus = new MessageBusInMemoryAdapter<mocks.MessageType>();
    bus.on("TEST_MESSAGE", async () => {
      calls.push("first start");
      await Promise.resolve();
      calls.push("first end");
    });
    bus.on("TEST_MESSAGE", () => {
      calls.push("second");
    });

    await bus.emit(mocks.message);

    expect(calls).toEqual(["first start", "first end", "second"]);
  });

  test("happy path - duplicate handler", async () => {
    const handler = jest.fn();
    const bus = new MessageBusInMemoryAdapter<mocks.MessageType>();
    bus.on("TEST_MESSAGE", handler);
    bus.on("TEST_MESSAGE", handler);

    await bus.emit(mocks.message);

    expect(handler).toHaveBeenCalledTimes(2);
  });

  test("happy path - handler registered during emit", async () => {
    const late = jest.fn();
    const bus = new MessageBusInMemoryAdapter<mocks.MessageType>();
    bus.on("TEST_MESSAGE", () => bus.on("TEST_MESSAGE", late));

    await bus.emit(mocks.message);

    expect(late).not.toHaveBeenCalled();
  });

  test("happy path - handlers deferred", async () => {
    const handler = jest.fn();
    const bus = new MessageBusInMemoryAdapter<mocks.MessageType>();
    bus.on("TEST_MESSAGE", handler);

    const emitting = bus.emit(mocks.message);

    expect(handler).not.toHaveBeenCalled();
    await emitting;
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test("error propagation - sync", async () => {
    const bus = new MessageBusInMemoryAdapter<mocks.MessageType>();
    bus.on("TEST_MESSAGE", mocks.throwIntentionalError);

    expect(async () => bus.emit(mocks.message)).toThrow(mocks.IntentionalError);
  });

  test("error propagation - async", async () => {
    const bus = new MessageBusInMemoryAdapter<mocks.MessageType>();
    bus.on("TEST_MESSAGE", mocks.throwIntentionalErrorAsync);

    expect(async () => bus.emit(mocks.message)).toThrow(mocks.IntentionalError);
  });

  test("error propagation - stops later handlers", async () => {
    const later = jest.fn();
    const bus = new MessageBusInMemoryAdapter<mocks.MessageType>();
    bus.on("TEST_MESSAGE", mocks.throwIntentionalErrorAsync);
    bus.on("TEST_MESSAGE", later);

    await bus.emit(mocks.message).catch(() => {});

    expect(later).not.toHaveBeenCalled();
  });
});
