import { describe, expect, spyOn, test } from "bun:test";
import { BetterAuthLogger } from "../src/better-auth-logger.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

describe("BetterAuthLogger", () => {
  test("info", () => {
    const service = new BetterAuthLogger(deps).attach();
    const loggerInfo = spyOn(Logger, "info");

    service.log("info", "User login attempt");

    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: "User login attempt",
      metadata: { args: [] },
      operation: "better-auth",
    });

    service.log("success", "User logged in");

    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: "User logged in",
      metadata: { args: [] },
      operation: "better-auth",
    });

    service.log("debug", "User metadata");

    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: "User metadata",
      metadata: { args: [] },
      operation: "better-auth",
    });
  });

  test("warn", () => {
    const service = new BetterAuthLogger(deps).attach();
    const loggerWarn = spyOn(Logger, "warn");

    service.log("warn", "User unavailable");

    expect(loggerWarn).toHaveBeenCalledWith({
      component: "infra",
      message: "User unavailable",
      metadata: { args: [] },
      operation: "better-auth",
    });
  });

  test("error", () => {
    const service = new BetterAuthLogger(deps).attach();
    const loggerError = spyOn(Logger, "error");

    const message = "User does not exist";
    service.log("error", message, { error: new Error(mocks.IntentionalError) });

    expect(loggerError).toHaveBeenCalledWith({
      component: "infra",
      message: "User does not exist",
      metadata: { args: [{ error: new Error(mocks.IntentionalError) }] },
      operation: "better-auth",
      error: new Error(message),
    });
  });
});
