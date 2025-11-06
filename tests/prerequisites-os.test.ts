import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteOs } from "../src/prerequisites/os";
import * as mocks from "./mocks";

const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

const accepted = ["Darwin", "Linux"];

describe("PrerequisiteOs", () => {
  test("success", async () => {
    expect(await new PrerequisiteOs({ label: "os", accepted }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure", async () => {
    expect(
      // @ts-expect-error
      (await new PrerequisiteOs({ label: "os", accepted: ["Nokia"] }).verify(clock)).error.message,
    ).toEqual("Unacceptable os: Nokia");
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteOs({ label: "os", accepted, enabled: false }).verify(clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });
});
