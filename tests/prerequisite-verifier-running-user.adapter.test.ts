import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import { PrerequisiteVerifierRunningUserAdapter } from "../src/prerequisite-verifier-running-user.adapter";
import * as mocks from "./mocks";

const username = "appuser";

describe("PrerequisiteVerifierRunningUserAdapter", () => {
  test("success", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username } as any);
    const prerequisite = new PrerequisiteVerifierRunningUserAdapter({ label: "user", username });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username } as any);
    const prerequisite = new PrerequisiteVerifierRunningUserAdapter({ label: "user", username: "root" });

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: `Current user: ${username}` }),
    );
  });
});
