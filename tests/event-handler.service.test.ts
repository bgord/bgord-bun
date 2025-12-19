import { describe, expect, spyOn, test } from "bun:test";
import { EventHandler } from "../src/event-handler.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const event = { name: "user.created" };

const Logger = new LoggerNoopAdapter();
const deps = { Logger };
const handler = new EventHandler(deps);

describe("EventHandler service", () => {
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

    const [call] = loggerError.mock.calls[0];
    expect(call).toMatchObject({
      message: "Unknown user.created event handler error",
      component: "infra",
      operation: "unknown_event_handler_error",
      metadata: event,
    });
    expect(call.error).toBeDefined();
    expect(call.error.name).toEqual("Error");
    expect(call.error.message).toEqual(mocks.IntentionalError);
    expect(typeof call.error.stack).toEqual("string");
  });
});
