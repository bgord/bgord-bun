import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { EventBusCollectingAdapter } from "../src/event-bus-collecting.adapter";
import { EventBusWithLoggerAdapter } from "../src/event-bus-with-logger.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";

type EventType = { name: "TEST_EVENT" };
const event = { name: "TEST_EVENT" } as const;

describe("EventBusWithLoggerAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const Logger = new LoggerCollectingAdapter();
    const inner = new EventBusCollectingAdapter<EventType>();
    const bus = new EventBusWithLoggerAdapter<EventType>(inner, { Logger });

    inner.on("TEST_EVENT", handler);
    await bus.emit("TEST_EVENT", event);
    await bus.emit("TEST_EVENT", event);

    expect(inner.events).toEqual(tools.repeat(event, 2));
    expect(Logger.entries).toEqual(
      tools.repeat(
        { message: "TEST_EVENT emitted", component: "infra", operation: "event_emitted", metadata: event },
        2,
      ),
    );
  });
});
