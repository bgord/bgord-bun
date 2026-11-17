import { describe, expect, spyOn, test } from "bun:test";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierTimezoneUtcAdapter } from "../src/prerequisite-verifier-timezone-utc.adapter";

const prerequisite = new PrerequisiteVerifierTimezoneUtcAdapter();

describe("PrerequisiteVerifierTimezoneUtcAdapter", () => {
  test("success", async () => {
    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure", async () => {
    using _ = spyOn(Intl, "DateTimeFormat").mockReturnValue({
      resolvedOptions: () => ({ timeZone: "Europe/Warsaw" }),
    } as Intl.DateTimeFormat);

    const result = await prerequisite.verify();

    expect(result).toEqual(PrerequisiteVerification.failure("Timezone: Europe/Warsaw"));
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("timezone-utc");
  });
});
