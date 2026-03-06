import { describe, expect, jest, test } from "bun:test";
import { EventBusEmitteryAdapter } from "../src/event-bus-emittery.adapter";

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
});
