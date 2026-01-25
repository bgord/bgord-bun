import { describe, expect, spyOn, test } from "bun:test";
import { BetterAuthLogger } from "../src/better-auth-logger.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

describe("BetterAuthLogger", () => {
  test("info", () => {
    const Logger = new LoggerCollectingAdapter();
    const service = new BetterAuthLogger({ Logger }).attach();

    service.log("info", "User login attempt");
    service.log("success", "User logged in");
    service.log("debug", "User metadata");

    expect(Logger.entries).toEqual([
      { component: "infra", message: "User login attempt", metadata: { args: [] }, operation: "better-auth" },
      { component: "infra", message: "User logged in", metadata: { args: [] }, operation: "better-auth" },
      { component: "infra", message: "User metadata", metadata: { args: [] }, operation: "better-auth" },
    ]);
  });

  test("warn", () => {
    const Logger = new LoggerCollectingAdapter();
    const service = new BetterAuthLogger({ Logger }).attach();
    const loggerWarn = spyOn(Logger, "warn");

    service.log("warn", "User unavailable");

    expect(Logger.entries).toEqual([
      { component: "infra", message: "User unavailable", metadata: { args: [] }, operation: "better-auth" },
    ]);
    expect(loggerWarn).toHaveBeenCalled();
  });

  test("error", () => {
    const Logger = new LoggerCollectingAdapter();
    const service = new BetterAuthLogger({ Logger }).attach();

    const message = "User does not exist";
    service.log("error", message, { error: new Error(mocks.IntentionalError) });

    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message,
        metadata: { args: [{ error: new Error(mocks.IntentionalError) }] },
        operation: "better-auth",
        error: new Error(message),
      },
    ]);
  });
});
