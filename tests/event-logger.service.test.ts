import { describe, expect, test } from "bun:test";
import { EventLogger } from "../src/event-logger.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";

const eventName = "user.created";

describe("EventLogger service", () => {
  test("happy path", () => {
    const Logger = new LoggerCollectingAdapter();
    const eventLogger = new EventLogger({ Logger });

    eventLogger.handle("emit", "debug:name", eventName, { userId: 123 });

    expect(Logger.entries).toEqual([
      {
        message: `${eventName} emitted`,
        component: "infra",
        operation: "event_emitted",
        metadata: { userId: 123 },
      },
    ]);
  });

  test("does not log subscribe commands", () => {
    const Logger = new LoggerCollectingAdapter();
    const eventLogger = new EventLogger({ Logger });

    eventLogger.handle("subscribe", "debug:name", eventName, { userId: 123 });

    expect(Logger.entries.length).toEqual(0);
  });

  test("does not log commands with symbol names", () => {
    const Logger = new LoggerCollectingAdapter();
    const eventLogger = new EventLogger({ Logger });

    // @ts-expect-error Symbol usage
    eventLogger.handle("emit", "debug:name", Symbol(eventName), { userId: 123 });

    expect(Logger.entries.length).toEqual(0);
  });
});
