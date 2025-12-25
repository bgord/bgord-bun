import { describe, expect, spyOn, test } from "bun:test";
import { Binary } from "../src/binary.vo";
import { PrerequisiteVerifierBinaryAdapter } from "../src/prerequisite-verifier-binary.adapter";
import * as mocks from "./mocks";

const binary = Binary.parse("node");

describe("PrerequisiteVerifierBinaryAdapter", () => {
  test("success", async () => {
    spyOn(Bun, "which").mockReturnValue(binary);
    const prerequisite = new PrerequisiteVerifierBinaryAdapter({ label: "binary", binary });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - binary not found", async () => {
    spyOn(Bun, "which").mockReturnValue(null);
    const prerequisite = new PrerequisiteVerifierBinaryAdapter({ label: "binary", binary });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure());
  });
});
