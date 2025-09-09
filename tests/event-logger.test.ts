import { describe, expect, spyOn, test } from "bun:test";
import { EventLogger } from "../src/event-logger.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

describe("EventLogger", () => {
  test("logs emitted event with metadata", () => {
    const logger = new LoggerNoopAdapter();
    const infoSpy = spyOn(logger, "info");
    const eventLogger = new EventLogger(logger as any);

    eventLogger.handle("emit", "debug:name", "user.created", { userId: 123 });

    expect(infoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "user.created emitted",
        component: "infra",
        operation: "event_emitted",
        metadata: { userId: 123 },
      }),
    );
  });

  test("does not log subscribe commands", () => {
    const logger = new LoggerNoopAdapter();
    const loggerInfo = spyOn(logger, "info");
    const commandLogger = new EventLogger(logger as any);

    commandLogger.handle("subscribe", "debug:name", "user.created", { userId: 123 });

    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("does not log commands with symbol names", () => {
    const logger = new LoggerNoopAdapter();
    const loggerInfo = spyOn(logger, "info");
    const commandLogger = new EventLogger(logger as any);

    commandLogger.handle("emit", "debug:name", Symbol("user.created") as any, { userId: 123 });

    expect(loggerInfo).not.toHaveBeenCalled();
  });
});
