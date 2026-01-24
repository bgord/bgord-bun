import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierWithLoggerAdapter } from "../src/prerequisite-verifier-with-logger.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

const pass = new mocks.PrerequisiteVerifierPass();
const fail = new mocks.PrerequisiteVerifierFail();
const undetermined = new mocks.PrerequisiteVerifierUndetermined();

describe("PrerequisiteVerifierWithLoggerAdapter", () => {
  test("success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const prerequisite = new PrerequisiteVerifierWithLoggerAdapter({ inner: pass }, { Clock, Logger });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: `Success - ${pass.kind}`,
        operation: "prerequisite_verify",
        metadata: expect.any(tools.Duration),
      },
    ]);
  });

  test("failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const prerequisite = new PrerequisiteVerifierWithLoggerAdapter({ inner: fail }, { Clock, Logger });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: `Failure - ${fail.kind}`,
        operation: "prerequisite_verify",
        error: { message: mocks.IntentionalError },
        metadata: expect.any(tools.Duration),
      },
    ]);
  });

  test("undetermined", async () => {
    const Logger = new LoggerCollectingAdapter();
    const prerequisite = new PrerequisiteVerifierWithLoggerAdapter(
      { inner: undetermined },
      { Clock, Logger },
    );

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.undetermined);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: `Undetermined - ${pass.kind}`,
        operation: "prerequisite_verify",
        metadata: expect.any(tools.Duration),
      },
    ]);
  });

  test("preserves kind", () => {
    const Logger = new LoggerCollectingAdapter();
    const prerequisite = new PrerequisiteVerifierWithLoggerAdapter({ inner: pass }, { Clock, Logger });

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
