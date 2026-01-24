import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { EventHandlerWithLoggerStrategy } from "../src/event-handler-with-logger.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const event = { name: "user.created" };

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("EventHandlerWithLoggerStrategy", () => {
  test("happy path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const handler = new EventHandlerWithLoggerStrategy({ Clock, Logger });
    const fn = async (_event: typeof event) => {};

    await handler.handle(fn)(event);

    expect(Logger.entries.length).toEqual(0);
  });

  test("error path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const handler = new EventHandlerWithLoggerStrategy({ Clock, Logger });

    await handler.handle(mocks.throwIntentionalErrorAsync)(event);

    expect(Logger.entries).toEqual([
      {
        message: "Unknown user.created event handler error",
        component: "infra",
        operation: "event_handler",
        metadata: { ...event, duration: expect.any(tools.Duration) },
        error: new Error(mocks.IntentionalError),
      },
    ]);
  });
});
