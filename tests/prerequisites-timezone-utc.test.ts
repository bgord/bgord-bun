import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteTimezoneUTC } from "../src/prerequisites/timezone-utc";
import * as mocks from "./mocks";

const utc = tools.Timezone.parse("UTC");

describe("PrerequisiteTimezoneUTC", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteTimezoneUTC({ label: "utc", timezone: utc });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const timezone = tools.Timezone.parse("Europe/Warsaw");
    const prerequisite = new PrerequisiteTimezoneUTC({ label: "utc", timezone });

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: `Timezone: ${timezone}` }),
    );
  });
});
