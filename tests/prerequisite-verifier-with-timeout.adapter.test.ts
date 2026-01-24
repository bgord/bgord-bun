import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierWithTimeoutAdapter } from "../src/prerequisite-verifier-with-timeout.adapter";
import { TimeoutRunnerNoopAdapter } from "../src/timeout-runner-noop.adapter";
import * as mocks from "./mocks";

const timeout = tools.Duration.MIN;

const pass = new mocks.PrerequisiteVerifierPass();
const fail = new mocks.PrerequisiteVerifierFail();

const TimeoutRunner = new TimeoutRunnerNoopAdapter();
const deps = { TimeoutRunner };

describe("PrerequisiteVerifierWithTimeoutAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierWithTimeoutAdapter({ inner: pass, timeout }, deps);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure", async () => {
    const prerequisite = new PrerequisiteVerifierWithTimeoutAdapter({ inner: fail, timeout }, deps);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
  });

  test("timeout", async () => {
    const TimeoutRunner = new TimeoutRunnerNoopAdapter();
    const deps = { TimeoutRunner };
    const prerequisite = new PrerequisiteVerifierWithTimeoutAdapter({ inner: pass, timeout }, deps);
    spyOn(TimeoutRunner, "run").mockImplementation(mocks.throwIntentionalError);

    expect(await prerequisite.verify()).toMatchObject(
      PrerequisiteVerification.failure(mocks.IntentionalError),
    );
  });

  test("preserves kind", () => {
    const prerequisite = new PrerequisiteVerifierWithTimeoutAdapter({ inner: pass, timeout }, deps);

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
