import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierNodeAdapter } from "../src/prerequisite-verifier-node.adapter";

const version = tools.PackageVersion.fromString("20.0.0");

describe("PrerequisiteVerifierNodeAdapter", () => {
  test("success - equal version", async () => {
    const prerequisite = new PrerequisiteVerifierNodeAdapter({ version, current: "v20.0.0" });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("success - greater version", async () => {
    const prerequisite = new PrerequisiteVerifierNodeAdapter({ version, current: "v20.10.0" });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - lower version", async () => {
    const prerequisite = new PrerequisiteVerifierNodeAdapter({ version, current: "v18.10.0" });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Version: v18.10.0"));
  });

  test("failure - invalid version", async () => {
    const prerequisite = new PrerequisiteVerifierNodeAdapter({ version, current: "abc" });

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure("Invalid version passed: abc"),
    );
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierNodeAdapter({ version, current: "abc" });

    expect(prerequisite.kind).toEqual("node");
  });
});
