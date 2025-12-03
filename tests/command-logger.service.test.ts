import { describe, expect, spyOn, test } from "bun:test";
import { CommandLogger } from "../src/command-logger.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

const Logger = new LoggerNoopAdapter();
const deps = { Logger };
const commandLogger = new CommandLogger(deps);

describe("CommandLogger service", () => {
  test("logs emitted command with metadata", () => {
    const loggerInfo = spyOn(Logger, "info");

    commandLogger.handle("emit", "debug:name", "user.created", { userId: 123 });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "user.created emitted",
      component: "infra",
      operation: "command_emitted",
      metadata: { userId: 123 },
    });
  });

  test("does not log subscribe commands", () => {
    const loggerInfo = spyOn(Logger, "info");

    commandLogger.handle("subscribe", "debug:name", "user.created", { userId: 123 });

    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("does not log commands with symbol names", () => {
    const loggerInfo = spyOn(Logger, "info");

    commandLogger.handle("emit", "debug:name", Symbol("user.created") as any, { userId: 123 });

    expect(loggerInfo).not.toHaveBeenCalled();
  });
});
