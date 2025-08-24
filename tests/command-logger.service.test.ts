import { describe, expect, spyOn, test } from "bun:test";
import { CommandLogger } from "../src/command-logger.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

describe("Command logger", () => {
  test("logs emitted command with metadata", () => {
    const logger = new LoggerNoopAdapter();
    const loggerInfo = spyOn(logger, "info");
    const commandLogger = new CommandLogger(logger as any);

    commandLogger.handle("emit", "debug:name", "user.created", { userId: 123 });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "user.created emitted",
      component: "infra",
      operation: "command_emitted",
      metadata: { userId: 123 },
    });
  });

  test("does not log subscribe commands", () => {
    const logger = new LoggerNoopAdapter();
    const loggerInfo = spyOn(logger, "info");
    const commandLogger = new CommandLogger(logger as any);

    commandLogger.handle("subscribe", "debug:name", "user.created", {
      userId: 123,
    });

    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("does not log commands with symbol names", () => {
    const logger = new LoggerNoopAdapter();
    const loggerInfo = spyOn(logger, "info");
    const commandLogger = new CommandLogger(logger as any);

    commandLogger.handle("emit", "debug:name", Symbol("user.created") as any, {
      userId: 123,
    });

    expect(loggerInfo).not.toHaveBeenCalled();
  });
});
