import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { EventBusEmitteryV1Adapter } from "../src/event-bus-emittery-v1.adapter";
import { EventBusWithLoggerAdapter } from "../src/event-bus-with-logger.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";

type EventType = { name: "TEST_EVENT" };
const event = { name: "TEST_EVENT" } as const;

describe("EventBusWithLoggerAdapter", () => {
  test("happy path", async () => {
    const handler = jest.fn();
    const Logger = new LoggerCollectingAdapter();
    const inner = new EventBusEmitteryV1Adapter<EventType>();
    const bus = new EventBusWithLoggerAdapter<EventType>(inner, { Logger });

    bus.on("TEST_EVENT", handler);
    await bus.emit(event);
    await bus.emit(event);

    expect(Logger.entries).toEqual(
      tools.repeat(
        { message: "TEST_EVENT emitted", component: "infra", operation: "event_emitted", metadata: event },
        2,
      ),
    );
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
