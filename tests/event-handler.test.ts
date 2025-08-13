import { describe, expect, spyOn, test } from "bun:test";
import { EventHandler } from "../src/event-handler.service";

class FakeLogger {
  error = (_: any) => {};
  formatError(error: unknown) {
    return { message: String((error as Error).message) };
  }
}

describe("Event handler", () => {
  test("calls handler without logging if no error", async () => {
    const logger = new FakeLogger();
    const loggerError = spyOn(logger, "error");

    const handler = new EventHandler(logger as any);
    const event = { name: "user.created" };

    const fn = async (_event: typeof event) => {};

    await handler.handle(fn)(event);

    expect(loggerError).not.toHaveBeenCalled();

    loggerError.mockRestore();
  });

  test("logs formatted error if handler throws", async () => {
    const logger = new FakeLogger();
    const loggerError = spyOn(logger, "error");
    const loggerFormatError = spyOn(logger, "formatError");

    const handler = new EventHandler(logger as any);
    const event = { name: "user.created" };

    const fn = async (_event: typeof event) => {
      throw new Error("Something failed");
    };

    await handler.handle(fn)(event);

    expect(loggerError).toHaveBeenCalledWith({
      message: "Unknown user.created event handler error",
      operation: "unknown_event_handler_error",
      metadata: { message: "Something failed" },
    });

    expect(loggerFormatError).toHaveBeenCalled();
  });
});
