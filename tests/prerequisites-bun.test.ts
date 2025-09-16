import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteBun } from "../src/prerequisites/bun";
import * as prereqs from "../src/prerequisites.service";

const base = tools.PackageVersion.fromString("1.0.0");

describe("prerequisites - bun", () => {
  test("returns success if current Bun version is equal to required version", async () => {
    const prerequisite = new PrerequisiteBun({ label: "bun", version: base, current: "1.0.0" });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("returns success if current Bun version is greater than required version", async () => {
    const prerequisite = new PrerequisiteBun({ label: "bun", version: base, current: "1.1.0" });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("returns failure if current Bun version is less than required version", async () => {
    const prerequisite = new PrerequisiteBun({ label: "bun", version: base, current: "0.1.0" });

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toEqual("Version: 1.0.0");
  });

  test("fails if invalid bun version gets passed", async () => {
    const prerequisite = new PrerequisiteBun({ label: "bun", version: base, current: "abc" });

    expect(await prerequisite.verify()).toEqual(
      prereqs.Verification.failure({ message: "Invalid version passed: abc" }),
    );
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteBun({
      label: "bun",
      enabled: false,
      version: base,
      current: "1.1.0",
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
