import { describe, expect, test } from "bun:test";
import { PrerequisiteVerifierSelfAdapter } from "../src/prerequisite-verifier-self.adapter";
import * as mocks from "./mocks";

const prerequisite = new PrerequisiteVerifierSelfAdapter();

describe("PrerequisiteVerifierSelfAdapter", () => {
  test("success", async () => {
    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("self");
  });
});
