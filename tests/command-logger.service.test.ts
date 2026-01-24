import { describe, expect, test } from "bun:test";
import { CommandLogger } from "../src/command-logger.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";

describe("CommandLogger service", () => {
  test("logs emitted command with metadata", () => {
    const Logger = new LoggerCollectingAdapter();
    const commandLogger = new CommandLogger({ Logger });

    commandLogger.handle("emit", "debug:name", "user.created", { userId: 123 });

    expect(Logger.entries).toEqual([
      {
        message: "user.created emitted",
        component: "infra",
        operation: "command_emitted",
        metadata: { userId: 123 },
      },
    ]);
  });

  test("does not log subscribe commands", () => {
    const Logger = new LoggerCollectingAdapter();
    const commandLogger = new CommandLogger({ Logger });

    commandLogger.handle("subscribe", "debug:name", "user.created", { userId: 123 });

    expect(Logger.entries.length).toEqual(0);
  });

  test("does not log commands with symbol names", () => {
    const Logger = new LoggerCollectingAdapter();
    const commandLogger = new CommandLogger({ Logger });

    // @ts-expect-error Symbol usage
    commandLogger.handle("emit", "debug:name", Symbol("user.created"), { userId: 123 });

    expect(Logger.entries.length).toEqual(0);
  });
});
