import { describe, expect, spyOn, test } from "bun:test";
import dns from "dns/promises";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierDnsAdapter } from "../src/prerequisite-verifier-dns.adapter";
import * as mocks from "./mocks";

const hostname = "api.example.com";
const result = { address: hostname, family: 4 };

const prerequisite = new PrerequisiteVerifierDnsAdapter({ hostname });

describe("PrerequisiteVerifierDnsAdapter", () => {
  test("success", async () => {
    using _ = spyOn(dns, "lookup").mockResolvedValue(result);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure", async () => {
    using _ = spyOn(dns, "lookup").mockRejectedValue(mocks.IntentionalError);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure(mocks.IntentionalError));
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("dns");
  });
});
