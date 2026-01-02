import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import { PrerequisiteVerifierRunningUserAdapter } from "../src/prerequisite-verifier-running-user.adapter";
import * as mocks from "./mocks";

const username = "appuser";

describe("PrerequisiteVerifierRunningUserAdapter", () => {
  test("success", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username } as any);
    const prerequisite = new PrerequisiteVerifierRunningUserAdapter({ username });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(os, "userInfo").mockReturnValue({ username } as any);
    const prerequisite = new PrerequisiteVerifierRunningUserAdapter({ username: "root" });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: `Current user: ${username}` }));
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierRunningUserAdapter({ username: "root" });

    expect(prerequisite.kind).toEqual("running-user");
  });
});
