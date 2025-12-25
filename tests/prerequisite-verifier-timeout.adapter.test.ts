import { describe, expect, spyOn, test } from "bun:test";
import dns from "dns/promises";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierDnsAdapter } from "../src/prerequisite-verifier-dns.adapter";
import { PrerequisiteVerifierTimeoutAdapter } from "../src/prerequisite-verifier-timeout.adapter";
import { TimeoutError } from "../src/timeout.service";
import * as mocks from "./mocks";

const hostname = "api.example.com";
const result = { address: hostname, family: 4 };

const inner = new PrerequisiteVerifierDnsAdapter({ hostname });
const prerequisite = new PrerequisiteVerifierTimeoutAdapter({ inner, timeout: tools.Duration.Ms(5) });

describe("PrerequisiteVerifierTimeoutAdapter", () => {
  test("success", async () => {
    spyOn(dns, "lookup").mockResolvedValue(result);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(dns, "lookup").mockRejectedValue(mocks.IntentionalError);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
  });

  test("timeout", async () => {
    // @ts-expect-error
    spyOn(dns, "lookup").mockImplementation(() => Bun.sleep(tools.Duration.Ms(6).ms));

    // @ts-expect-error
    const result = (await prerequisite.verify()).error.message;

    expect(result).toEqual(TimeoutError.Exceeded);
  });

  test("preserves kind", () => {
    expect(prerequisite.kind).toEqual(inner.kind);
  });
});
