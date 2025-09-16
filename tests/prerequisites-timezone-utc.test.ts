import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteTimezoneUTC } from "../src/prerequisites/timezone-utc";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - timezone utc", () => {
  test("returns success if timezone is valid UTC", async () => {
    const timezone = tools.Timezone.parse("UTC");
    const prerequisite = new PrerequisiteTimezoneUTC({ label: "tz", timezone });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("returns failure if timezone is invalid", async () => {
    const timezone = tools.Timezone.parse("Europe/Warsaw");
    const prerequisite = new PrerequisiteTimezoneUTC({ label: "tz", timezone });

    expect(await prerequisite.verify()).toEqual(
      prereqs.Verification.failure({ message: `Timezone: ${timezone}` }),
    );
  });

  test("returns undetermined if disabled", async () => {
    const timezone = tools.Timezone.parse("UTC");
    const prerequisite = new PrerequisiteTimezoneUTC({ label: "tz", timezone, enabled: false });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
