import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteBun } from "../src/prerequisites/bun";
import * as mocks from "./mocks";

const version = tools.PackageVersion.fromString("1.0.0");
const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteBun", () => {
  test("success - Bun version is equal", async () => {
    expect(await new PrerequisiteBun({ label: "bun", version, current: "1.0.0" }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("success - Bun version is greater", async () => {
    expect(await new PrerequisiteBun({ label: "bun", version, current: "1.1.0" }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - Bun version is less", async () => {
    expect(
      // @ts-expect-error
      (await new PrerequisiteBun({ label: "bun", version, current: "0.1.0" }).verify(clock)).error.message,
    ).toEqual("Version: 1.0.0");
  });

  test("failure - invalid Bun version", async () => {
    expect(await new PrerequisiteBun({ label: "bun", version, current: "abc" }).verify(clock)).toEqual(
      mocks.VerificationFailure({ message: "Invalid version passed: abc" }),
    );
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteBun({ label: "bun", enabled: false, version, current: "1.1.0" }).verify(clock),
    ).toEqual(mocks.VerificationUndetermined);
  });
});
