import { describe, expect, test } from "bun:test";
import { PrerequisiteVerifierSelfAdapter } from "../src/prerequisite-verifier-self.adapter";
import * as mocks from "./mocks";

describe("PrerequisiteVerifierSelfAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierSelfAdapter();

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });
});
