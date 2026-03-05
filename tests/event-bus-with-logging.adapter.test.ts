import { describe, expect, test } from "bun:test";
import { EventBusCollectingAdapter } from "../src/event-bus-collecting.adapter";
import { EventBusWithLoggerAdapter } from "../src/event-bus-with-logging.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";

type EventType = { name: "TEST_EVENT"; payload: { value: number } };

const event: EventType = { name: "TEST_EVENT", payload: { value: 42 } };

describe("EventBusWithLoggerAdapter", () => {
  test("happy path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new EventBusCollectingAdapter<EventType>();
    const bus = new EventBusWithLoggerAdapter<EventType>(inner, { Logger });

    await bus.emit("TEST_EVENT", event);

    expect(inner.events).toEqual([event]);
    expect(Logger.entries).toEqual([
      {
        message: "TEST_EVENT emitted",
        component: "infra",
        operation: "event_emitted",
        metadata: event,
      },
    ]);
  });
});
