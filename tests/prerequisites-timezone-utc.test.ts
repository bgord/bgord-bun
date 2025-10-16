import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteTimezoneUTC } from "../src/prerequisites/timezone-utc";
import * as prereqs from "../src/prerequisites.service";

const utc = tools.Timezone.parse("UTC");

describe("PrerequisiteTimezoneUTC", () => {
  test("success", async () => {
    expect(await new PrerequisiteTimezoneUTC({ label: "utc", timezone: utc }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure", async () => {
    const timezone = tools.Timezone.parse("Europe/Warsaw");

    expect(await new PrerequisiteTimezoneUTC({ label: "utc", timezone }).verify()).toEqual(
      prereqs.Verification.failure({ message: `Timezone: ${timezone}` }),
    );
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteTimezoneUTC({ label: "utc", timezone: utc, enabled: false }).verify(),
    ).toEqual(prereqs.Verification.undetermined());
  });
});
