import { describe, expect, test } from "bun:test";

import { PrerequisiteStatusEnum } from "../src/prerequisites.service";
import { PrerequisiteSelf } from "../src/prerequisites/self";

describe("prerequisites - self", () => {
  test("verify method returns success for self strategy", async () => {
    const result = await new PrerequisiteSelf({ label: "self" }).verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteSelf({
      label: "prerequisite",
      enabled: false,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
