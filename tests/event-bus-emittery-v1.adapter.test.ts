import { describe, expect, jest, test } from "bun:test";
import { EventBusEmitteryV1Adapter } from "../src/event-bus-emittery-v1.adapter";

type EventType = { name: "TEST_EVENT" };
const event = { name: "TEST_EVENT" } as const;

describe("EventBusEmitteryV1Adapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new EventBusEmitteryV1Adapter<EventType>();

    bus.on("TEST_EVENT", handler);
    await bus.emit(event);

    expect(handler).toHaveBeenCalledWith(event);
  });
});
