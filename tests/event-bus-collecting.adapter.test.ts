import { describe, expect, jest, test } from "bun:test";
import { EventBusCollectingAdapter } from "../src/event-bus-collecting.adapter";

type EventType = { name: "TEST_EVENT" };

const event = { name: "TEST_EVENT" } as const;

describe("EventBusCollectingAdapter", () => {
  test("emit", async () => {
    const bus = new EventBusCollectingAdapter<EventType>();

    await bus.emit("TEST_EVENT", event);
    await bus.emit("TEST_EVENT", event);

    expect(bus.events).toEqual([event, event]);
  });

  test("on", async () => {
    const handler = jest.fn();
    const bus = new EventBusCollectingAdapter<EventType>();

    bus.on("TEST_EVENT", handler);

    await bus.emit("TEST_EVENT", event);

    expect(handler).not.toHaveBeenCalled();
  });
});
