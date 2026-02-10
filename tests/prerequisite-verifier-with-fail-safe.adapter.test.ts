import { describe, expect, spyOn, test } from "bun:test";
import {
  PrerequisiteVerification,
  PrerequisiteVerificationOutcome,
  type PrerequisiteVerificationResult,
} from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierWithFailSafeAdapter } from "../src/prerequisite-verifier-with-fail-safe.adapter";
import * as mocks from "./mocks";

const pass = new mocks.PrerequisiteVerifierPass();
const fail = new mocks.PrerequisiteVerifierFail();
const undetermined = new mocks.PrerequisiteVerifierUndetermined();

const specificError = (result: PrerequisiteVerificationResult) =>
  result.outcome === PrerequisiteVerificationOutcome.failure &&
  result.error?.message === mocks.IntentionalError;

describe("PrerequisiteVerifierWithLoggerAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierWithFailSafeAdapter({ inner: pass });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - any failure", async () => {
    const prerequisite = new PrerequisiteVerifierWithFailSafeAdapter({ inner: fail });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.undetermined);
  });

  test("failure - specific failure - downgrade", async () => {
    const prerequisite = new PrerequisiteVerifierWithFailSafeAdapter({ inner: fail, when: specificError });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.undetermined);
  });

  test("failure - specific failure - no downgrade", async () => {
    const OtherError = "other.error";
    const prerequisite = new PrerequisiteVerifierWithFailSafeAdapter({ inner: fail, when: specificError });
    using _ = spyOn(fail, "verify").mockResolvedValue(PrerequisiteVerification.failure(OtherError));

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(OtherError));
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteVerifierWithFailSafeAdapter({ inner: undetermined });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.undetermined);
  });

  test("preserves kind", () => {
    const prerequisite = new PrerequisiteVerifierWithFailSafeAdapter({ inner: pass });

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
