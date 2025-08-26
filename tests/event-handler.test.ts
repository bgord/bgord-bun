import { describe, expect, spyOn, test } from "bun:test";
import { EventHandler } from "../src/event-handler.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

const logger = new LoggerNoopAdapter();

describe("Event handler", () => {
  test("calls handler without logging if no error", async () => {
    const errorSpy = spyOn(logger, "error");

    const handler = new EventHandler(logger);
    const event = { name: "user.created" };

    const fn = async (_event: typeof event) => {};
    await handler.handle(fn)(event);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("logs structured error if handler throws", async () => {
    const errorSpy = spyOn(logger, "error");

    const handler = new EventHandler(logger);
    const event = { name: "user.created" };

    const fn = async (_event: typeof event) => {
      throw new Error("Something failed");
    };
    await handler.handle(fn)(event);

    expect(errorSpy).toHaveBeenCalledTimes(1);

    const [arg] = errorSpy.mock.calls[0];
    expect(arg).toMatchObject({
      message: "Unknown user.created event handler error",
      component: "infra",
      operation: "unknown_event_handler_error",
      metadata: { name: "user.created" },
    });
    expect(arg.error).toBeDefined();
    expect(arg.error.name).toBe("Error");
    expect(arg.error.message).toBe("Something failed");
    expect(typeof arg.error.stack).toBe("string");
  });
});
