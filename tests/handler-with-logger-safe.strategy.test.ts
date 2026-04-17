import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { HandlerWithLoggerSafeStrategy } from "../src/handler-with-logger-safe.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("HandlerWithLoggerSafeStrategy", () => {
  test("happy path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const handler = new HandlerWithLoggerSafeStrategy({ Clock, Logger });
    const fn = async (_: mocks.MessageType) => {};

    await handler.handle(fn)(mocks.message);

    expect(Logger.entries.length).toEqual(0);
  });

  test("error path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const handler = new HandlerWithLoggerSafeStrategy({ Clock, Logger });

    await CorrelationStorage.run(mocks.correlationId, async () =>
      expect(async () => handler.handle(mocks.throwIntentionalErrorAsync)(mocks.message)).not.toThrow(),
    );

    expect(Logger.entries).toEqual([
      {
        message: `Unknown ${mocks.message.name} handler error`,
        correlationId: mocks.correlationId,
        component: "infra",
        operation: "handler_safe",
        metadata: { name: mocks.message.name, duration: expect.any(tools.Duration) },
        error: new Error(mocks.IntentionalError),
      },
    ]);
  });
});
