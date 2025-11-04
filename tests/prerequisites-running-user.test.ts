import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteRunningUser } from "../src/prerequisites/running-user";
import * as prereqs from "../src/prerequisites.service";
import * as mocks from "./mocks";

const username = "appuser";
const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteRunningUser", () => {
  test("success", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username } as any);

    expect(await new PrerequisiteRunningUser({ label: "user", username }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username } as any);

    expect(await new PrerequisiteRunningUser({ label: "user", username: "root" }).verify(clock)).toEqual(
      prereqs.Verification.failure({ message: `Current user: ${username}` }),
    );
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteRunningUser({ label: "user", username: "appuser", enabled: false }).verify(clock),
    ).toEqual(prereqs.Verification.undetermined());
  });
});
