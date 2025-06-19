import { describe, expect, spyOn, test } from "bun:test";
import fsp from "node:fs/promises";
import { PrerequisitePath } from "../src/prerequisites/path";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";

const DUMMY_PATH = "/mocked/path";

describe("prerequisites - path", () => {
  test("returns success if path is accessible with required flags", async () => {
    const fspAccess = spyOn(fsp, "access").mockResolvedValue();

    const prerequisite = new PrerequisitePath({
      label: "Test Path",
      path: DUMMY_PATH,
      access: { write: true },
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);

    fspAccess.mockRestore();
  });

  test("returns failure if access throws error", async () => {
    const fspAccess = spyOn(fsp, "access").mockRejectedValue(() => {
      throw new Error("No access");
    });

    const prerequisite = new PrerequisitePath({
      label: "Test Path",
      path: DUMMY_PATH,
      access: { write: true },
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);

    fspAccess.mockRestore();
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
