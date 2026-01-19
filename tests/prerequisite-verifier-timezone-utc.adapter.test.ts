import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierTimezoneUtcAdapter } from "../src/prerequisite-verifier-timezone-utc.adapter";

const utc = tools.Timezone.parse("UTC");

describe("PrerequisiteVerifierTimezoneUtcAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierTimezoneUtcAdapter({ timezone: utc });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure", async () => {
    const timezone = tools.Timezone.parse("Europe/Warsaw");
    const prerequisite = new PrerequisiteVerifierTimezoneUtcAdapter({ timezone });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(`Timezone: ${timezone}`));
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierTimezoneUtcAdapter({ timezone: utc });

    expect(prerequisite.kind).toEqual("timezone-utc");
  });
});
