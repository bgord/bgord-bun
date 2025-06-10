import { describe, expect, spyOn, test } from "bun:test";

import { PrerequisiteStatusEnum } from "../src/prerequisites.service";
import { PrerequisiteOutsideConnectivity } from "../src/prerequisites/outside-connectivity";

describe("prerequisites - outside connectivity", () => {
  test("verify method returns success for successful outside connectivity", async () => {
    const globalFetch = spyOn(global, "fetch").mockResolvedValue({
      ok: true,
    } as any);

    const result = await new PrerequisiteOutsideConnectivity({
      label: "outside-connectivity",
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);

    globalFetch.mockRestore();
  });

  test("verify method returns failure for unsuccessful outside connectivity", async () => {
    const globalFetch = spyOn(global, "fetch").mockResolvedValue({
      ok: false,
    } as any);

    const result = await new PrerequisiteOutsideConnectivity({
      label: "outside-Connectivity",
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);

    globalFetch.mockRestore();
  });

  test("verify method returns failure on error during outside connectivity check", async () => {
    const globalFetch = spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

    const result = await new PrerequisiteOutsideConnectivity({
      label: "outside-connectivity",
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);

    globalFetch.mockRestore();
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteOutsideConnectivity({
      label: "prerequisite",
      enabled: false,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
