import { describe, expect, spyOn, test } from "bun:test";
import { PrerequisiteOutsideConnectivity } from "../src/prerequisites/outside-connectivity";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - outside connectivity", () => {
  test("verify method returns success for successful outside connectivity", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);

    const result = await new PrerequisiteOutsideConnectivity({ label: "outside-connectivity" }).verify();

    expect(result).toEqual(prereqs.Verification.success());
  });

  test("verify method returns failure for unsuccessful outside connectivity", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400 } as any);

    const result = await new PrerequisiteOutsideConnectivity({
      label: "outside-Connectivity",
    }).verify();

    expect(result).toEqual(prereqs.Verification.failure({ message: "HTTP 400" }));
  });

  test("verify method returns failure on error during outside connectivity check", async () => {
    spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

    const result = await new PrerequisiteOutsideConnectivity({
      label: "outside-connectivity",
    }).verify();

    // @ts-expect-error
    expect(result.error.message).toMatch(/Network error/);
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteOutsideConnectivity({
      label: "prerequisite",
      enabled: false,
    });

    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.undetermined());
  });
});
