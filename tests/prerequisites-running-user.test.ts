import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteRunningUser } from "../src/prerequisites/running-user";
import * as mocks from "./mocks";

const username = "appuser";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteRunningUser", () => {
  test("success", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username } as any);
    const prerequisite = new PrerequisiteRunningUser({ label: "user", username });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username } as any);
    const prerequisite = new PrerequisiteRunningUser({ label: "user", username: "root" });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: `Current user: ${username}` }),
    );
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteRunningUser({ label: "user", username, enabled: false });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
