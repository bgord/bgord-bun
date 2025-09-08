import { describe, expect, test } from "bun:test";
import { PrerequisiteSelf } from "../src/prerequisites/self";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - self", () => {
  test("verify method returns success for self strategy", async () => {
    const result = await new PrerequisiteSelf({ label: "self" }).verify();
    expect(result).toEqual(prereqs.Verification.success());
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteSelf({
      label: "prerequisite",
      enabled: false,
    });

    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.undetermined());
  });
});
