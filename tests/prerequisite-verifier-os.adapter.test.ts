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

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toEqual("Unacceptable os: Nokia");
  });
});
