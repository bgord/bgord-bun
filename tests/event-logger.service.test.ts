import { describe, expect, spyOn, test } from "bun:test";
import { EventLogger } from "../src/event-logger.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

const logger = new LoggerNoopAdapter();
const eventLogger = new EventLogger(logger);
const eventName = "user.created";

describe("EventLogger service", () => {
  test("happy path", () => {
    const loggerInfoSpy = spyOn(logger, "info");

    eventLogger.handle("emit", "debug:name", eventName, { userId: 123 });

    expect(loggerInfoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: `${eventName} emitted`,
        component: "infra",
        operation: "event_emitted",
        metadata: { userId: 123 },
      }),
    );
  });

  test("does not log subscribe commands", () => {
    const loggerInfo = spyOn(logger, "info");

    eventLogger.handle("subscribe", "debug:name", eventName, { userId: 123 });

    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("does not log commands with symbol names", () => {
    const loggerInfo = spyOn(logger, "info");

    eventLogger.handle("emit", "debug:name", Symbol(eventName), { userId: 123 });

    expect(loggerInfo).not.toHaveBeenCalled();
  });
});
