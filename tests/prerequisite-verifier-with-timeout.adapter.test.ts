import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierWithTimeoutAdapter } from "../src/prerequisite-verifier-with-timeout.adapter";
import { TimeoutError } from "../src/timeout-runner.port";
import { TimeoutRunnerErrorAdapter } from "../src/timeout-runner-error.adapter";
import { TimeoutRunnerNoopAdapter } from "../src/timeout-runner-noop.adapter";
import * as mocks from "./mocks";

const timeout = tools.Duration.Ms(1);

const pass = new mocks.PrerequisiteVerifierPass();
const fail = new mocks.PrerequisiteVerifierFail();

const TimeoutRunner = new TimeoutRunnerNoopAdapter();
const deps = { TimeoutRunner };

describe("PrerequisiteVerifierWithTimeoutAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierWithTimeoutAdapter({ inner: pass, timeout }, deps);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const prerequisite = new PrerequisiteVerifierWithTimeoutAdapter({ inner: fail, timeout }, deps);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
  });

  test("timeout", async () => {
    const TimeoutRunner = new TimeoutRunnerErrorAdapter();
    const deps = { TimeoutRunner };
    const prerequisite = new PrerequisiteVerifierWithTimeoutAdapter({ inner: pass, timeout }, deps);

    // @ts-expect-error
    const result = (await prerequisite.verify()).error.message;

    expect(result).toEqual(TimeoutError.Exceeded);
  });

  test("preserves kind", () => {
    const prerequisite = new PrerequisiteVerifierWithTimeoutAdapter({ inner: pass, timeout }, deps);

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
