import { describe, expect, jest, spyOn, test } from "bun:test";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as prereqs from "../src/prerequisites.service";

class Ok implements prereqs.Prerequisite {
  readonly label = "ok";
  readonly kind = "test";
  readonly enabled = true;
  async verify(): Promise<prereqs.VerifyOutcome> {
    return prereqs.Verification.success();
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
  async verify(): Promise<prereqs.VerifyOutcome> {
    return prereqs.Verification.undetermined();
  }
}

const logger = new LoggerNoopAdapter();
const runner = new prereqs.Prerequisites(logger);

describe("Prerequisites", () => {
  test("exits and logs error when any prerequisite fails", async () => {
    const loggerErrorSpy = spyOn(logger, "error").mockImplementation(jest.fn());

    expect(async () => runner.check([new Ok(), new Fail()])).toThrow(/Prerequisites failed/);

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

  test("logs Prerequisites ok and does not exit when all succeed", async () => {
    const loggerInfoSpy = spyOn(logger, "info").mockImplementation(jest.fn());
    await runner.check([new Ok(), new Ok()]);
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      expect.objectContaining({ component: "infra", operation: "startup", message: "Prerequisites ok" }),
    );
  });

  test("treats undetermined as ok (no exit)", async () => {
    const loggerInfoSpy = spyOn(logger, "info").mockImplementation(jest.fn());
    await runner.check([new Ok(), new Undetermined()]);
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      expect.objectContaining({ component: "infra", operation: "startup", message: "Prerequisites ok" }),
    );
  });
});
