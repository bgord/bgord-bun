import { describe, expect, spyOn, test } from "bun:test";
import { PrerequisiteOutsideConnectivity } from "../src/prerequisites/outside-connectivity";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - outside connectivity", () => {
  test("verify method returns success for successful outside connectivity", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);

    const prerequisite = new PrerequisiteOutsideConnectivity({ label: "outside-connectivity" });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("verify method returns failure for unsuccessful outside connectivity", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400 } as any);

    const prerequisite = new PrerequisiteOutsideConnectivity({ label: "outside-Connectivity" });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.failure({ message: "HTTP 400" }));
  });

  test("verify method returns failure on error during outside connectivity check", async () => {
    spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

    const prerequisite = new PrerequisiteOutsideConnectivity({ label: "outside-connectivity" });
    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(/Network error/);
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteOutsideConnectivity({ label: "prerequisite", enabled: false });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
