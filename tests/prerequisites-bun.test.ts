import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteBun } from "../src/prerequisites/bun";
import * as mocks from "./mocks";

const version = tools.PackageVersion.fromString("1.0.0");

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteBun", () => {
  test("success - equal version", async () => {
    const prerequisite = new PrerequisiteBun({ label: "bun", version, current: "1.0.0" });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("success - greater version", async () => {
    const prerequisite = new PrerequisiteBun({ label: "bun", version, current: "1.1.0" });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure - lower version", async () => {
    const prerequisite = new PrerequisiteBun({ label: "bun", version, current: "0.1.0" });

    // @ts-expect-error
    expect((await prerequisite.verify(Clock)).error.message).toEqual("Version: 1.0.0");
  });

  test("failure - invalid version", async () => {
    const prerequisite = new PrerequisiteBun({ label: "bun", version, current: "abc" });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "Invalid version passed: abc" }),
    );
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteBun({ label: "bun", enabled: false, version, current: "1.1.0" });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
