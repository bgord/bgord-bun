import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../src/clock.port";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as prereqs from "../src/prerequisites.service";
import * as mocks from "./mocks";

class Ok implements prereqs.Prerequisite {
  readonly label = "ok";
  readonly kind = "test";
  readonly enabled = true;
  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());
    return prereqs.Verification.success(stopwatch.stop());
  }
}

class Fail implements prereqs.Prerequisite {
  readonly label = "fail";
  readonly kind = "test";
  readonly enabled = true;
  async verify(): Promise<prereqs.VerifyOutcome> {
    return prereqs.Verification.failure({ message: "boom" });
  }
}

class Undetermined implements prereqs.Prerequisite {
  readonly label = "undetermined";
  readonly kind = "test";
  readonly enabled = false;
  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());
    return prereqs.Verification.undetermined(stopwatch.stop());
  }
}

const logger = new LoggerNoopAdapter();
const clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const runner = new prereqs.Prerequisites({ logger, clock });

describe("Prerequisites service", () => {
  test("happy path", async () => {
    const loggerInfoSpy = spyOn(logger, "info").mockImplementation(jest.fn());

    await runner.check([new Ok(), new Ok()]);

    expect(loggerInfoSpy).toHaveBeenCalledWith(
      expect.objectContaining({ component: "infra", operation: "startup", message: "Prerequisites ok" }),
    );
  });

  test("failure", async () => {
    const loggerErrorSpy = spyOn(logger, "error").mockImplementation(jest.fn());

    expect(async () => runner.check([new Ok(), new Fail()])).toThrow(prereqs.PrerequisitesError.Failure);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
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
    const loggerInfoSpy = spyOn(logger, "info").mockImplementation(jest.fn());

    await runner.check([new Ok(), new Undetermined()]);

    expect(loggerInfoSpy).toHaveBeenCalledWith(
      expect.objectContaining({ component: "infra", operation: "startup", message: "Prerequisites ok" }),
    );
  });
});
