import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierTimezoneUtcAdapter } from "../src/prerequisite-verifier-timezone-utc.adapter";
import * as mocks from "./mocks";

const utc = tools.Timezone.parse("UTC");

describe("PrerequisiteVerifierTimezoneUtcAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierTimezoneUtcAdapter({ timezone: utc });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const timezone = tools.Timezone.parse("Europe/Warsaw");
    const prerequisite = new PrerequisiteVerifierTimezoneUtcAdapter({ timezone });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: `Timezone: ${timezone}` }));
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierTimezoneUtcAdapter({ timezone: utc });

    expect(prerequisite.kind).toEqual("timezone-utc");
  });
});
