import { describe, expect, spyOn, test } from "bun:test";
import dns from "dns/promises";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierDnsAdapter } from "../src/prerequisite-verifier-dns.adapter";
import { PrerequisiteVerificationOutcome } from "../src/prerequisites.service";
import * as mocks from "./mocks";

const hostname = "api.example.com";
const result = { address: hostname, family: 4 };

describe("PrerequisiteVerifierDnsAdapter", () => {
  test("success", async () => {
    spyOn(dns, "lookup").mockResolvedValue(result);
    const prerequisite = new PrerequisiteVerifierDnsAdapter({ hostname });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(dns, "lookup").mockRejectedValue(mocks.IntentionalError);
    const prerequisite = new PrerequisiteVerifierDnsAdapter({ hostname });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
  });

  test("timeout", async () => {
    // @ts-expect-error
    spyOn(dns, "lookup").mockImplementation(() => Bun.sleep(tools.Duration.Ms(6).ms));
    const prerequisite = new PrerequisiteVerifierDnsAdapter({ hostname, timeout: tools.Duration.Ms(5) });

    expect((await prerequisite.verify()).outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });
});
