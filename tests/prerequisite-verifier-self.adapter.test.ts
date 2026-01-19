import { describe, expect, test } from "bun:test";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierSelfAdapter } from "../src/prerequisite-verifier-self.adapter";

const prerequisite = new PrerequisiteVerifierSelfAdapter();

describe("PrerequisiteVerifierSelfAdapter", () => {
  test("success", async () => {
    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("self");
  });
});
