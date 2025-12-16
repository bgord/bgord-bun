import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteOs } from "../src/prerequisites/os";
import * as mocks from "./mocks";

const accepted = ["Darwin", "Linux"];

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteOs", () => {
  test("success", async () => {
    expect(await new PrerequisiteOs({ label: "os", accepted }).verify(Clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure", async () => {
    expect(
      // @ts-expect-error
      (await new PrerequisiteOs({ label: "os", accepted: ["Nokia"] }).verify(Clock)).error.message,
    ).toEqual("Unacceptable os: Nokia");
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteOs({ label: "os", accepted, enabled: false }).verify(Clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });
});
