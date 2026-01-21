import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { Prerequisite } from "../src/prerequisite.vo";
import { PrerequisiteRunnerStartup } from "../src/prerequisite-runner-startup.service";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "../src/prerequisite-verifier.port";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Logger, Clock };

const runner = new PrerequisiteRunnerStartup(deps);

describe("PrerequisiteRunnerStartup service", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");

    await runner.check([mocks.PrerequisiteOk, mocks.PrerequisiteOk]);

    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      operation: "startup",
      message: "Prerequisites ok",
    });
  });

  test("failure", async () => {
    const loggerError = spyOn(Logger, "error");

    expect(async () => runner.check([mocks.PrerequisiteOk, mocks.PrerequisiteFail])).toThrow(
      "prerequisites.failure",
    );
    expect(loggerError).toHaveBeenCalledWith({
      component: "infra",
      operation: "startup",
      message: "Prerequisite failed",
      metadata: { label: "fail", kind: "test" },
      error: { message: mocks.IntentionalError },
    });
  });

  test("undetermined", async () => {
    const loggerInfo = spyOn(Logger, "info");

    await runner.check([mocks.PrerequisiteOk, mocks.PrerequisiteUndetermined]);

    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      operation: "startup",
      message: "Prerequisites ok",
    });
  });

  test("skips disabled", async () => {
    const PrerequisiteDisabled = new Prerequisite("undetermined", new mocks.PrerequisiteVerifierPass(), {
      enabled: false,
    });
    const loggerInfo = spyOn(Logger, "info");
    const prerequisiteDisabledBuild = spyOn(PrerequisiteDisabled, "build");

    await runner.check([mocks.PrerequisiteOk, PrerequisiteDisabled]);

    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      operation: "startup",
      message: "Prerequisites ok",
    });
    expect(prerequisiteDisabledBuild).not.toHaveBeenCalled();
  });

  test("unknown error log", async () => {
    class PrerequisiteVerifierError implements PrerequisiteVerifierPort {
      async verify(): Promise<PrerequisiteVerificationResult> {
        return PrerequisiteVerification.failure();
      }

      get kind() {
        return "error";
      }
    }
    const PrerequisiteError = new Prerequisite("error", new PrerequisiteVerifierError());
    const loggerError = spyOn(Logger, "error");

    expect(async () => runner.check([PrerequisiteError])).toThrow("prerequisites.failure");
    expect(loggerError).toHaveBeenCalledWith({
      component: "infra",
      error: new Error("Unknown error"),
      message: "Prerequisite failed",
      metadata: {
        kind: PrerequisiteError.kind,
        label: "error",
      },
      operation: "startup",
    });
  });
});
