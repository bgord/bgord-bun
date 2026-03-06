import { describe, expect, jest, test } from "bun:test";
import { EventBusEmitteryAdapter } from "../src/event-bus-emittery.adapter";
import * as mocks from "./mocks";

type EventType = { name: "TEST_EVENT" };
const event = { name: "TEST_EVENT" } as const;

describe("EventBusEmitteryAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new EventBusEmitteryAdapter<EventType>();

    bus.on("TEST_EVENT", handler);
    await bus.emit(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  test("error propagation - sync", async () => {
    const bus = new EventBusEmitteryAdapter<EventType>();

    bus.on("TEST_EVENT", mocks.throwIntentionalError);

    expect(async () => bus.emit(event)).toThrow(mocks.IntentionalError);
  });

  test("error propagation - async", async () => {
    const bus = new EventBusEmitteryAdapter<EventType>();

    bus.on("TEST_EVENT", mocks.throwIntentionalErrorAsync);

    expect(async () => bus.emit(event)).toThrow(mocks.IntentionalError);
  });
});
