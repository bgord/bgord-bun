import { describe, expect, jest, test } from "bun:test";
import { EventBusNoopAdapter } from "../src/event-bus-noop.adapter";

type EventType = { name: "TEST_EVENT" };
const event = { name: "TEST_EVENT" } as const;

describe("EventBusNoopAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const bus = new EventBusNoopAdapter<EventType>();

    bus.on("TEST_EVENT", handler);
    await bus.emit("TEST_EVENT", event);

    expect(handler).not.toHaveBeenCalled();
  });
});
