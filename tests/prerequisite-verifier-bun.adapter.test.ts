import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierBunAdapter } from "../src/prerequisite-verifier-bun.adapter";

const version = tools.PackageVersion.fromString("1.0.0");

describe("PrerequisiteVerifierBunAdapter", () => {
  test("success - equal version", async () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ version, current: "1.0.0" });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - greater version", async () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ version, current: "1.1.0" });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - lower version", async () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ version, current: "0.1.0" });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Version: 1.0.0"));
  });

  test("failure - invalid version", async () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ version, current: "abc" });

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("Invalid version passed: abc"),
    );
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ version, current: "abc" });

    expect(prerequisite.kind).toEqual("bun");
  });
});
