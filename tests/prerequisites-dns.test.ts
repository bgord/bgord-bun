import { describe, expect, spyOn, test } from "bun:test";
import dns from "dns/promises";
import * as tools from "@bgord/tools";
import { PrerequisiteDNS } from "../src/prerequisites/dns";
import { PrerequisiteVerificationOutcome } from "../src/prerequisites.service";
import * as mocks from "./mocks";

const hostname = "api.example.com";
const result = { address: hostname, family: 4 };

describe("PrerequisiteExternalApi", () => {
  test("success", async () => {
    spyOn(dns, "lookup").mockResolvedValue(result);
    const prerequisite = new PrerequisiteDNS({ label: "dns", hostname });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(dns, "lookup").mockRejectedValue(mocks.IntentionalError);
    const prerequisite = new PrerequisiteDNS({ label: "dns", hostname });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteDNS({ label: "dns", hostname, enabled: false });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });

  test("timeout", async () => {
    // @ts-expect-error
    spyOn(dns, "lookup").mockImplementation(() => Bun.sleep(tools.Duration.Ms(6).ms));
    const prerequisite = new PrerequisiteDNS({ label: "dns", hostname, timeout: tools.Duration.Ms(5) });

    expect((await prerequisite.verify()).outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });
});
