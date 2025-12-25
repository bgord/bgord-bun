import { describe, expect, test } from "bun:test";
import { PrerequisiteOs } from "../src/prerequisites/os";
import * as mocks from "./mocks";

const accepted = ["Darwin", "Linux"];

describe("PrerequisiteOs", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteOs({ label: "os", accepted });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const prerequisite = new PrerequisiteOs({ label: "os", accepted: ["Nokia"] });

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toEqual("Unacceptable os: Nokia");
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteOs({ label: "os", accepted, enabled: false });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });
});
