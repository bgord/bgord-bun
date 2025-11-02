import { describe, expect, spyOn, test } from "bun:test";
import { EventHandler } from "../src/event-handler.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const logger = new LoggerNoopAdapter();

const event = { name: "user.created" };
const handler = new EventHandler(logger);

describe("EventHandler service", () => {
  test("happy path", async () => {
    const loggerErrorSpy = spyOn(logger, "error");

    const fn = async (_event: typeof event) => {};
    await handler.handle(fn)(event);

    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });

  test("error path", async () => {
    const loggerErrorSpy = spyOn(logger, "error");

    const fn = async (_event: typeof event) => {
      throw new Error(mocks.IntentialError);
    };
    await handler.handle(fn)(event);

    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);

    // @ts-expect-error
    const [call] = loggerErrorSpy.mock.calls[0];

    expect(call).toMatchObject({
      message: "Unknown user.created event handler error",
      component: "infra",
      operation: "unknown_event_handler_error",
      metadata: event,
    });
    expect(call.error).toBeDefined();
    expect(call.error.name).toEqual("Error");
    expect(call.error.message).toEqual(mocks.IntentialError);
    expect(typeof call.error.stack).toEqual("string");
  });
});
