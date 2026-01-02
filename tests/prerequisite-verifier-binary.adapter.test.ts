import { describe, expect, spyOn, test } from "bun:test";
import { Binary } from "../src/binary.vo";
import { PrerequisiteVerificationOutcome } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierBinaryAdapter } from "../src/prerequisite-verifier-binary.adapter";
import * as mocks from "./mocks";

const binary = Binary.parse("node");

const prerequisite = new PrerequisiteVerifierBinaryAdapter({ binary });

describe("PrerequisiteVerifierBinaryAdapter", () => {
  test("success", async () => {
    spyOn(Bun, "which").mockReturnValue(binary);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - binary not found", async () => {
    spyOn(Bun, "which").mockReturnValue(null);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure());
  });

  test("failure - error", async () => {
    spyOn(Bun, "which").mockImplementation(mocks.throwIntentionalError);

    const result = await prerequisite.verify();

    expect(result.outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("binary");
  });
});
