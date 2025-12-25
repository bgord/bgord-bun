import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import { PrerequisiteRunningUser } from "../src/prerequisites/running-user";
import * as mocks from "./mocks";

const username = "appuser";

describe("PrerequisiteRunningUser", () => {
  test("success", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username } as any);
    const prerequisite = new PrerequisiteRunningUser({ label: "user", username });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username } as any);
    const prerequisite = new PrerequisiteRunningUser({ label: "user", username: "root" });

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: `Current user: ${username}` }),
    );
  });
});
