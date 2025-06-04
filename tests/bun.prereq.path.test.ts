import { describe, expect, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisitePath } from "../src/prerequisites/path";

const DUMMY_PATH = "/mocked/path";

describe("prerequisites - path", () => {
  test("returns success if path is accessible with required flags", async () => {
    const accessSpy = spyOn(fsp, "access").mockResolvedValue();

    const prerequisite = new PrerequisitePath({
      label: "Test Path",
      path: DUMMY_PATH,
      access: { write: true },
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);

    accessSpy.mockRestore();
  });

  test("returns failure if access throws error", async () => {
    const accessSpy = spyOn(fsp, "access").mockRejectedValue(() => {
      throw new Error("No access");
    });

    const prerequisite = new PrerequisitePath({
      label: "Test Path",
      path: DUMMY_PATH,
      access: { write: true },
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);

    accessSpy.mockRestore();
  });

  test("returns undetermined if prerequisite is disabled", async () => {
    const prerequisite = new PrerequisitePath({
      label: "Disabled Path",
      path: DUMMY_PATH,
      enabled: false,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
