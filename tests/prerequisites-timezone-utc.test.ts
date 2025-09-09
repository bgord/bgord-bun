import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteTimezoneUTC } from "../src/prerequisites/timezone-utc";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - timezone utc", () => {
  test("returns success if timezone is valid UTC", async () => {
    const prerequisite = new PrerequisiteTimezoneUTC({
      label: "Timezone Check",
      timezone: tools.Timezone.parse("UTC"),
    });
    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.success());
  });

  test("returns failure if timezone is invalid", async () => {
    const timezone = tools.Timezone.parse("Europe/Warsaw");
    const prerequisite = new PrerequisiteTimezoneUTC({ label: "Timezone Check", timezone });
    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.failure({ message: `Timezone: ${timezone}` }));
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteTimezoneUTC({
      label: "Timezone Check",
      timezone: tools.Timezone.parse("UTC"),
      enabled: false,
    });
    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.undetermined());
  });
});
