import { describe, expect, spyOn, test } from "bun:test";
import dns from "dns/promises";
import { PrerequisiteVerifierDnsAdapter } from "../src/prerequisite-verifier-dns.adapter";
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
});
