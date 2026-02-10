import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { Prerequisite } from "../src/prerequisite.vo";
import { PrerequisiteRunnerStartup } from "../src/prerequisite-runner-startup.service";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "../src/prerequisite-verifier.port";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteRunnerStartup service", () => {
  test("happy path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const runner = new PrerequisiteRunnerStartup({ Logger, Clock });

    await runner.check([mocks.PrerequisiteOk, mocks.PrerequisiteOk]);

    expect(Logger.entries).toEqual([
      { component: "infra", operation: "startup", message: "Prerequisites ok" },
    ]);
  });

  test("failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const runner = new PrerequisiteRunnerStartup({ Logger, Clock });

    expect(async () => runner.check([mocks.PrerequisiteOk, mocks.PrerequisiteFail])).toThrow(
      "prerequisites.failure",
    );
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "startup",
        message: "Prerequisite failed",
        metadata: { label: "fail", kind: "test" },
        error: { message: mocks.IntentionalError },
      },
    ]);
  });

  test("undetermined", async () => {
    const Logger = new LoggerCollectingAdapter();
    const runner = new PrerequisiteRunnerStartup({ Logger, Clock });

    await runner.check([mocks.PrerequisiteOk, mocks.PrerequisiteUndetermined]);

    expect(Logger.entries).toEqual([
      { component: "infra", operation: "startup", message: "Prerequisites ok" },
    ]);
  });

  test("skips disabled", async () => {
    const Logger = new LoggerCollectingAdapter();
    const runner = new PrerequisiteRunnerStartup({ Logger, Clock });
    const PrerequisiteDisabled = new Prerequisite("undetermined", new mocks.PrerequisiteVerifierPass(), {
      enabled: false,
    });
    using prerequisiteDisabledBuild = spyOn(PrerequisiteDisabled, "build");

    await runner.check([mocks.PrerequisiteOk, PrerequisiteDisabled]);

    expect(Logger.entries).toEqual([
      { component: "infra", operation: "startup", message: "Prerequisites ok" },
    ]);
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
    const Logger = new LoggerCollectingAdapter();
    const runner = new PrerequisiteRunnerStartup({ Logger, Clock });

    expect(async () => runner.check([PrerequisiteError])).toThrow("prerequisites.failure");
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        error: new Error("Unknown error"),
        message: "Prerequisite failed",
        metadata: {
          kind: PrerequisiteError.kind,
          label: "error",
        },
        operation: "startup",
      },
    ]);
  });
});
