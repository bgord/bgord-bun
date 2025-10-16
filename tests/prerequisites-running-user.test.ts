import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import { PrerequisiteRunningUser } from "../src/prerequisites/running-user";
import * as prereqs from "../src/prerequisites.service";

const username = "appuser";

describe("PrerequisiteRunningUser", () => {
  test("success", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username } as any);

    expect(await new PrerequisiteRunningUser({ label: "user", username }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username } as any);

    expect(await new PrerequisiteRunningUser({ label: "user", username: "root" }).verify()).toEqual(
      prereqs.Verification.failure({ message: `Current user: ${username}` }),
    );
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteRunningUser({ label: "user", username: "appuser", enabled: false }).verify(),
    ).toEqual(prereqs.Verification.undetermined());
  });
});
