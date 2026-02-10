import { describe, expect, spyOn, test } from "bun:test";
import os from "node:os";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierRunningUserAdapter } from "../src/prerequisite-verifier-running-user.adapter";

const username = "appuser";
const userInfo = { username, uid: 0, gid: 0, shell: "", homedir: "" };

describe("PrerequisiteVerifierRunningUserAdapter", () => {
  test("success", async () => {
    using _ = spyOn(os, "userInfo").mockReturnValue(userInfo);
    const prerequisite = new PrerequisiteVerifierRunningUserAdapter({ username });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure", async () => {
    using _ = spyOn(os, "userInfo").mockReturnValue(userInfo);
    const prerequisite = new PrerequisiteVerifierRunningUserAdapter({ username: "root" });

    expect(await prerequisite.verify()).toEqual(
      PrerequisiteVerification.failure(`Current user: ${username}`),
    );
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierRunningUserAdapter({ username: "root" });

    expect(prerequisite.kind).toEqual("running-user");
  });
});
