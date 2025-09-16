import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import { PrerequisiteRunningUser } from "../src/prerequisites/running-user";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - running user", () => {
  test("returns success when current user matches expected", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username: "appuser" } as any);

    const prerequisite = new PrerequisiteRunningUser({ label: "user", username: "appuser" });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("returns failure with message when current user differs", async () => {
    const userInfoSpy = spyOn(os, "userInfo").mockReturnValue({ username: "root" } as any);

    const prerequisite = new PrerequisiteRunningUser({ label: "user", username: "appuser" });

    expect(await prerequisite.verify()).toEqual(
      prereqs.Verification.failure({ message: "Current user: root" }),
    );

    userInfoSpy.mockRestore();
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteRunningUser({ label: "user", username: "appuser", enabled: false });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
