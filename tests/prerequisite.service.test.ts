import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as prereqs from "../src/prerequisites.service";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Logger, Clock };

const runner = new prereqs.Prerequisites(deps);

describe("Prerequisites service", () => {
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
      prereqs.PrerequisitesError.Failure,
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
