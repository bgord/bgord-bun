import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierBunAdapter } from "../src/prerequisite-verifier-bun.adapter";
import * as mocks from "./mocks";

const version = tools.PackageVersion.fromString("1.0.0");

describe("PrerequisiteVerifierBunAdapter", () => {
  test("success - equal version", async () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ label: "bun", version, current: "1.0.0" });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("success - greater version", async () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ label: "bun", version, current: "1.1.0" });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - lower version", async () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ label: "bun", version, current: "0.1.0" });

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toEqual("Version: 1.0.0");
  });

  test("failure - invalid version", async () => {
    const prerequisite = new PrerequisiteVerifierBunAdapter({ label: "bun", version, current: "abc" });

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: "Invalid version passed: abc" }),
    );
  });
});
