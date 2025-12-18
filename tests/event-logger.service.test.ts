import { describe, expect, spyOn, test } from "bun:test";
import { EventLogger } from "../src/event-logger.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

const eventName = "user.created";

const Logger = new LoggerNoopAdapter();
const deps = { Logger };
const eventLogger = new EventLogger(deps);

describe("EventLogger service", () => {
  test("happy path", () => {
    const loggerInfo = spyOn(Logger, "info");

    eventLogger.handle("emit", "debug:name", eventName, { userId: 123 });

    expect(loggerInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: `${eventName} emitted`,
        component: "infra",
        operation: "event_emitted",
        metadata: { userId: 123 },
      }),
    );
  });

  test("does not log subscribe commands", () => {
    const loggerInfo = spyOn(Logger, "info");

    eventLogger.handle("subscribe", "debug:name", eventName, { userId: 123 });

    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("does not log commands with symbol names", () => {
    const loggerInfo = spyOn(Logger, "info");

    // @ts-expect-error
    eventLogger.handle("emit", "debug:name", Symbol(eventName), { userId: 123 });

    expect(loggerInfo).not.toHaveBeenCalled();
  });
});
