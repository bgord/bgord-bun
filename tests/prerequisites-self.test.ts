import { describe, expect, test } from "bun:test";
import { PrerequisiteSelf } from "../src/prerequisites/self";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - self", () => {
  test("verify method returns success for self strategy", async () => {
    const prerequisite = new PrerequisiteSelf({ label: "self" });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteSelf({ label: "prerequisite", enabled: false });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
