import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteOs } from "../src/prerequisites/os";
import * as mocks from "./mocks";

const accepted = ["Darwin", "Linux"];

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteOs", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteOs({ label: "os", accepted });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const prerequisite = new PrerequisiteOs({ label: "os", accepted: ["Nokia"] });

    // @ts-expect-error
    expect((await prerequisite.verify(Clock)).error.message).toEqual("Unacceptable os: Nokia");
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteOs({ label: "os", accepted, enabled: false });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
