import { describe, expect, jest, test } from "bun:test";
import { EventBusEmitteryV1Adapter } from "../src/event-bus-emittery-v1.adapter";

type EventType = { name: "TEST_EVENT"; payload: { value: number } };

const event: EventType = { name: "TEST_EVENT", payload: { value: 42 } };

describe("EventBusEmitteryV1Adapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new EventBusEmitteryV1Adapter<EventType>();
    bus.on("TEST_EVENT", handler);

    await bus.emit("TEST_EVENT", event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  test("multiple handlers", async () => {
    const first = jest.fn();
    const second = jest.fn();
    const bus = new EventBusEmitteryV1Adapter<EventType>();
    bus.on("TEST_EVENT", first);
    bus.on("TEST_EVENT", second);

    await bus.emit("TEST_EVENT", event);

    expect(first).toHaveBeenCalledWith(event);
    expect(second).toHaveBeenCalledWith(event);
  });
});
