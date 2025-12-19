import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as prereqs from "../src/prerequisites.service";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const runner = new prereqs.Prerequisites({ Logger, Clock });

describe("Prerequisites service", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");

    await runner.check([new mocks.PrerequisiteOk(), new mocks.PrerequisiteOk()]);

    expect(loggerInfo).toHaveBeenCalledWith(
      expect.objectContaining({ component: "infra", operation: "startup", message: "Prerequisites ok" }),
    );
  });

  test("failure", async () => {
    const loggerError = spyOn(Logger, "error");

    expect(async () => runner.check([new mocks.PrerequisiteOk(), new mocks.PrerequisiteFail()])).toThrow(
      prereqs.PrerequisitesError.Failure,
    );

    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        component: "infra",
        operation: "startup",
        message: "Prerequisite failed",
        metadata: expect.objectContaining({ label: "fail", kind: "test" }),
        error: expect.objectContaining({ message: "boom" }),
      }),
    );
  });

  test("undetermined", async () => {
    const loggerInfo = spyOn(Logger, "info");

    await runner.check([new mocks.PrerequisiteOk(), new mocks.PrerequisiteUndetermined()]);

    expect(loggerInfo).toHaveBeenCalledWith(
      expect.objectContaining({ component: "infra", operation: "startup", message: "Prerequisites ok" }),
    );
  });
});
