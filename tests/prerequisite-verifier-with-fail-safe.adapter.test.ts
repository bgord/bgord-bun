import { describe, expect, spyOn, test } from "bun:test";
import {
  PrerequisiteVerificationOutcome,
  type PrerequisiteVerificationResult,
} from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierWithFailSafeAdapter } from "../src/prerequisite-verifier-with-fail-safe.adapter";
import * as mocks from "./mocks";

const pass = new mocks.PrerequisiteVerifierPass();
const fail = new mocks.PrerequisiteVerifierFail();
const undetermined = new mocks.PrerequisiteVerifierUndetermined();

const anyError = (result: PrerequisiteVerificationResult) =>
  result.outcome === PrerequisiteVerificationOutcome.failure;

const specificError = (result: PrerequisiteVerificationResult) =>
  // @ts-expect-error
  result.outcome === PrerequisiteVerificationOutcome.failure && result.error === mocks.IntentionalError;

describe("PrerequisiteVerifierWithLoggerAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierWithFailSafeAdapter({ inner: pass, when: anyError });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - any failure", async () => {
    const prerequisite = new PrerequisiteVerifierWithFailSafeAdapter({ inner: fail, when: anyError });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });

  test("failure - specific failure - downgrade", async () => {
    const prerequisite = new PrerequisiteVerifierWithFailSafeAdapter({ inner: fail, when: specificError });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });

  test("failure - specific failure - no downgrade", async () => {
    const OtherError = "other.error";
    spyOn(fail, "verify").mockResolvedValue(mocks.VerificationFailure(OtherError));
    const prerequisite = new PrerequisiteVerifierWithFailSafeAdapter({ inner: fail, when: specificError });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(OtherError));
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteVerifierWithFailSafeAdapter({ inner: undetermined, when: anyError });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });

  test("preserves kind", () => {
    const prerequisite = new PrerequisiteVerifierWithFailSafeAdapter({ inner: pass, when: anyError });

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
