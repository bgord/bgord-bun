import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierWithLoggerAdapter } from "../src/prerequisite-verifier-with-logger.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const Logger = new LoggerNoopAdapter();
const deps = { Clock, Logger };

const pass = new mocks.PrerequisiteVerifierPass();
const fail = new mocks.PrerequisiteVerifierFail();
const undetermined = new mocks.PrerequisiteVerifierUndetermined();

describe("PrerequisiteVerifierWithLoggerAdapter", () => {
  test("success", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const prerequisite = new PrerequisiteVerifierWithLoggerAdapter({ inner: pass }, deps);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: `Success - ${pass.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
    });
  });

  test("failure", async () => {
    const loggerError = spyOn(Logger, "error");
    const prerequisite = new PrerequisiteVerifierWithLoggerAdapter({ inner: fail }, deps);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(loggerError).toHaveBeenCalledWith({
      component: "infra",
      message: `Failure - ${fail.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
      error: { message: mocks.IntentionalError },
    });
  });

  test("undetermined", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const prerequisite = new PrerequisiteVerifierWithLoggerAdapter({ inner: undetermined }, deps);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.undetermined);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: `Undetermined - ${pass.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
    });
  });

  test("preserves kind", () => {
    const prerequisite = new PrerequisiteVerifierWithLoggerAdapter({ inner: pass }, deps);

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
