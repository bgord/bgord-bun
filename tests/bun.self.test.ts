import { describe, expect, test } from "bun:test";
import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteSelf } from "../src/prerequisites/self";

describe("PrerequisiteSelfVerificator class", () => {
  test("verify method returns success for self strategy", async () => {
    const result = await new PrerequisiteSelf({ label: "self" }).verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);
  });
});
