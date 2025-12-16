import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteTimezoneUTC } from "../src/prerequisites/timezone-utc";
import * as mocks from "./mocks";

const utc = tools.Timezone.parse("UTC");

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteTimezoneUTC", () => {
  test("success", async () => {
    expect(await new PrerequisiteTimezoneUTC({ label: "utc", timezone: utc }).verify(Clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure", async () => {
    const timezone = tools.Timezone.parse("Europe/Warsaw");

    expect(await new PrerequisiteTimezoneUTC({ label: "utc", timezone }).verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: `Timezone: ${timezone}` }),
    );
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteTimezoneUTC({ label: "utc", timezone: utc, enabled: false }).verify(Clock),
    ).toEqual(mocks.VerificationUndetermined);
  });
});
