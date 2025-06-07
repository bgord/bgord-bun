import { describe, expect, spyOn, test } from "bun:test";

import { EventLogger } from "../src/event-logger";

class FakeLogger {
  info = (_: any) => {};
}

describe("Event logger", () => {
  test("logs emitted event with metadata", () => {
    const logger = new FakeLogger();
    const loggerInfo = spyOn(logger, "info");

    const eventLogger = new EventLogger(logger as any);

    eventLogger.handle("emit", "debug:name", "user.created", { userId: 123 });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "user.created emitted",
      operation: "event_emitted",
      metadata: { userId: 123 },
    });
  });

  test("does not log subscribe events", () => {
    const logger = new FakeLogger();
    const loggerInfo = spyOn(logger, "info");

    const eventLogger = new EventLogger(logger as any);

    eventLogger.handle("subscribe", "debug:name", "user.created", {
      userId: 123,
    });

    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("does not log events with symbol names", () => {
    const logger = new FakeLogger();
    const loggerInfo = spyOn(logger, "info");

    const eventLogger = new EventLogger(logger as any);

    eventLogger.handle("emit", "debug:name", Symbol("user.created") as any, {
      userId: 123,
    });

    expect(loggerInfo).not.toHaveBeenCalled();
  });
});
