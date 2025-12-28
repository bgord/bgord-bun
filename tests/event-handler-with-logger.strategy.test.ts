import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { EventHandlerWithLoggerStrategy } from "../src/event-handler-with-logger.strategy";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const event = { name: "user.created" };

const Logger = new LoggerNoopAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Logger, Clock };

const handler = new EventHandlerWithLoggerStrategy(deps);

describe("EventHandlerWithLoggerStrategy", () => {
  test("happy path", async () => {
    const loggerErrorSpy = spyOn(Logger, "error");
    const fn = async (_event: typeof event) => {};

    await handler.handle(fn)(event);

    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });

  test("error path", async () => {
    const loggerError = spyOn(Logger, "error");

    await handler.handle(mocks.throwIntentionalErrorAsync)(event);

    expect(loggerError).toHaveBeenCalledTimes(1);

    // @ts-expect-error
    const [call] = loggerError.mock.calls[0];
    expect(call).toMatchObject({
      message: "Unknown user.created event handler error",
      component: "infra",
      operation: "event_handler",
      metadata: event,
    });
    expect(call.error).toBeDefined();
    expect(call.error.name).toEqual("Error");
    expect(call.error.message).toEqual(mocks.IntentionalError);
    expect(typeof call.error.stack).toEqual("string");
  });
});
