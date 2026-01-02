import { describe, expect, test } from "bun:test";
import { PrerequisiteVerifierOsAdapter } from "../src/prerequisite-verifier-os.adapter";
import * as mocks from "./mocks";

const accepted = ["Darwin", "Linux"];

describe("PrerequisiteVerifierOsAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierOsAdapter({ accepted });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const prerequisite = new PrerequisiteVerifierOsAdapter({ accepted: ["Nokia"] });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "Unacceptable os: Nokia" }));
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierOsAdapter({ accepted });

    expect(prerequisite.kind).toEqual("os");
  });
});
