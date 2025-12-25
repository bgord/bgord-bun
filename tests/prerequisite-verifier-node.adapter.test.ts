import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierNodeAdapter } from "../src/prerequisite-verifier-node.adapter";
import * as mocks from "./mocks";

const version = tools.PackageVersion.fromString("20.0.0");

describe("PrerequisiteVerifierNodeAdapter", () => {
  test("success - equal version", async () => {
    const prerequisite = new PrerequisiteVerifierNodeAdapter({ version, current: "v20.0.0" });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("success - greater version", async () => {
    const prerequisite = new PrerequisiteVerifierNodeAdapter({ version, current: "v20.10.0" });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - lower version", async () => {
    const prerequisite = new PrerequisiteVerifierNodeAdapter({ version, current: "v18.10.0" });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "Version: v18.10.0" }));
  });

  test("failure - invalid version", async () => {
    const prerequisite = new PrerequisiteVerifierNodeAdapter({ version, current: "abc" });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "Invalid version passed: abc" }));
  });
});
