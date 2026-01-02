import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierBunAdapter } from "../src/prerequisite-verifier-bun.adapter";
import * as mocks from "./mocks";

const version = tools.PackageVersion.fromString("1.0.0");

describe("PrerequisiteVerifierBunAdapter", () => {
  test("success - equal version", async () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ version, current: "1.0.0" });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("success - greater version", async () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ version, current: "1.1.0" });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - lower version", async () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ version, current: "0.1.0" });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "Version: 1.0.0" }));
  });

  test("failure - invalid version", async () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ version, current: "abc" });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "Invalid version passed: abc" }));
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ version, current: "abc" });

    expect(prerequisite.kind).toEqual("bun");
  });
});
