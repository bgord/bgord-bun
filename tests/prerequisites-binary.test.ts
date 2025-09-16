import { describe, expect, spyOn, test } from "bun:test";
import bun from "bun";
import { PrerequisiteBinary } from "../src/prerequisites/binary";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - binary", () => {
  test("returns success if binary is found", async () => {
    // @ts-expect-error
    spyOn(bun, "$").mockImplementation(() => ({ quiet: () => ({ exitCode: 0 }) }));

    const prerequisite = new PrerequisiteBinary({ label: "binary", binary: "real-binary" });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("returns failure if binary is not found", async () => {
    // @ts-expect-error
    spyOn(bun, "$").mockImplementation(() => ({ quiet: () => ({ exitCode: 1 }) }));

    const prerequisite = new PrerequisiteBinary({ label: "binary", binary: "fake-binary" });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.failure({ message: `Exit code ${1}` }));
  });

  test("returns failure if binary name is invalid", async () => {
    const prerequisite = new PrerequisiteBinary({ label: "binary", binary: "invalid binary" });
    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(/binary_invalid/);
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteBinary({ label: "binary", binary: "node", enabled: false });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
