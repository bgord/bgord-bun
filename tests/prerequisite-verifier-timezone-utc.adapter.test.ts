import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierTimezoneUtcAdapter } from "../src/prerequisite-verifier-timezone-utc.adapter";

const utc = v.parse(tools.Timezone, "UTC");

describe("PrerequisiteVerifierTimezoneUtcAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierTimezoneUtcAdapter({ timezone: utc });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure", async () => {
    const timezone = v.parse(tools.Timezone, "Europe/Warsaw");
    const prerequisite = new PrerequisiteVerifierTimezoneUtcAdapter({ timezone });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(`Timezone: ${timezone}`));
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierTimezoneUtcAdapter({ timezone: utc });

    expect(prerequisite.kind).toEqual("timezone-utc");
  });
});
