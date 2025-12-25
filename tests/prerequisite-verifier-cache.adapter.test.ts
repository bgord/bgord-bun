import { describe, expect, jest, spyOn, test } from "bun:test";
import dns from "dns/promises";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleAdapter } from "../src/cache-resolver-simple.adapter";
import { HashContentSha256BunAdapter } from "../src/hash-content-sha256-bun.adapter";
import { PrerequisiteVerifierCacheAdapter } from "../src/prerequisite-verifier-cache.adapter";
import { PrerequisiteVerifierDnsAdapter } from "../src/prerequisite-verifier-dns.adapter";
import * as mocks from "./mocks";

const hostname = "api.example.com";
const result = { address: hostname, family: 4 };
const inner = new PrerequisiteVerifierDnsAdapter({ hostname });

const ttl = tools.Duration.Minutes(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ ttl });
const HashContent = new HashContentSha256BunAdapter();
const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
const deps = { CacheResolver, HashContent };

const prerequisite = new PrerequisiteVerifierCacheAdapter({ id: "dns", inner }, deps);

describe("PrerequisiteVerifierCacheAdapter", () => {
  test("success", async () => {
    jest.useFakeTimers();
    const dnsLookup = spyOn(dns, "lookup").mockResolvedValue(result);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(dnsLookup).toHaveBeenCalledTimes(1);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(dnsLookup).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.Ms(1)).ms);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(dnsLookup).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("failure", async () => {
    jest.useFakeTimers();
    const dnsLookup = spyOn(dns, "lookup").mockRejectedValue(mocks.IntentionalError);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(dnsLookup).toHaveBeenCalledTimes(1);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(dnsLookup).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.Ms(1)).ms);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(dnsLookup).toHaveBeenCalledTimes(2);

    await CacheRepository.flush();
    jest.useRealTimers();
  });

  test("preserves kind", () => {
    expect(prerequisite.kind).toEqual(inner.kind);
  });
});
