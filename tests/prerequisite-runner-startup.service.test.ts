import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { PrerequisiteRunnerStartup } from "../src/prerequisite-runner-startup.service";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Logger, Clock };

const runner = new PrerequisiteRunnerStartup(deps);

describe("PrerequisiteRunnerStartup service", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");

    await runner.check([mocks.PrerequisiteOk, mocks.PrerequisiteOk]);

    expect(loggerInfo).toHaveBeenCalledWith(
      expect.objectContaining({ component: "infra", operation: "startup", message: "Prerequisites ok" }),
    );
  });

  test("failure", async () => {
    const loggerError = spyOn(Logger, "error");

    expect(async () => runner.check([mocks.PrerequisiteOk, mocks.PrerequisiteFail])).toThrow(
      "prerequisites.failure",
    );

    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        component: "infra",
        operation: "startup",
        message: "Prerequisite failed",
        metadata: expect.objectContaining({ label: "fail", kind: "test" }),
        error: mocks.IntentionalError,
      }),
    );
  });

  test("undetermined", async () => {
    const loggerInfo = spyOn(Logger, "info");

    await runner.check([mocks.PrerequisiteOk, mocks.PrerequisiteUndetermined]);

    expect(loggerInfo).toHaveBeenCalledWith(
      expect.objectContaining({ component: "infra", operation: "startup", message: "Prerequisites ok" }),
    );
  });
});
