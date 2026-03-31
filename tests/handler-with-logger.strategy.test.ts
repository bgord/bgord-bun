import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { HandlerWithLoggerStrategy } from "../src/handler-with-logger.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("HandlerWithLoggerStrategy", () => {
  test("happy path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const handler = new HandlerWithLoggerStrategy({ Clock, Logger });
    const fn = async (_: mocks.MessageType) => {};

    await handler.handle(fn)(mocks.message);

    expect(Logger.entries.length).toEqual(0);
  });

  test("error path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const handler = new HandlerWithLoggerStrategy({ Clock, Logger });

    await handler.handle(mocks.throwIntentionalErrorAsync)(mocks.message);

    expect(Logger.entries).toEqual([
      {
        message: `Unknown ${mocks.message.name} handler error`,
        component: "infra",
        operation: "handler",
        metadata: { ...mocks.message, duration: expect.any(tools.Duration) },
        error: new Error(mocks.IntentionalError),
      },
    ]);
  });
});
