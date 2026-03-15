import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { MessageHandlerWithLoggerStrategy } from "../src/message-handler-with-logger.strategy";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("MessageHandlerWithLoggerStrategy", () => {
  test("happy path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const handler = new MessageHandlerWithLoggerStrategy({ Clock, Logger });
    const fn = async (_: mocks.MessageType) => {};

    await handler.handle(fn)(mocks.message);

    expect(Logger.entries.length).toEqual(0);
  });

  test("error path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const handler = new MessageHandlerWithLoggerStrategy({ Clock, Logger });

    await handler.handle(mocks.throwIntentionalErrorAsync)(mocks.message);

    expect(Logger.entries).toEqual([
      {
        message: `Unknown ${mocks.message.name} message handler error`,
        component: "infra",
        operation: "message_handler",
        metadata: { ...mocks.message, duration: expect.any(tools.Duration) },
        error: new Error(mocks.IntentionalError),
      },
    ]);
  });
});
