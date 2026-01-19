import { describe, expect, test } from "bun:test";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierOsAdapter } from "../src/prerequisite-verifier-os.adapter";

const accepted = ["Darwin", "Linux"];

describe("PrerequisiteVerifierOsAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierOsAdapter({ accepted });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure", async () => {
    const prerequisite = new PrerequisiteVerifierOsAdapter({ accepted: ["Nokia", "Samsung"] });

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("Unacceptable os: Nokia, Samsung"),
    );
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierOsAdapter({ accepted });

    expect(prerequisite.kind).toEqual("os");
  });
});
