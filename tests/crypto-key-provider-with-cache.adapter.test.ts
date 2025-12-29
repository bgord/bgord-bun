import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CryptoKeyProviderNoopAdapter } from "../src/crypto-key-provider-noop.adapter";
import { CryptoKeyProviderWithCacheAdapter } from "../src/crypto-key-provider-with-cache.adapter";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";

const inner = new CryptoKeyProviderNoopAdapter();

const ttl = tools.Duration.Minutes(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
const HashContent = new HashContentSha256BunStrategy();
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const deps = { CacheResolver, HashContent };

const adapter = new CryptoKeyProviderWithCacheAdapter({ id: "crypto-key", inner }, deps);

describe("CryptoKeyProviderWithCacheAdapter", () => {
  test("happy path", async () => {
    jest.useFakeTimers();
    const innerRead = spyOn(inner, "get");

    expect(await adapter.get()).toBeInstanceOf(CryptoKey);
    expect(innerRead).toHaveBeenCalledTimes(1);

    expect(await adapter.get()).toBeInstanceOf(CryptoKey);
    expect(innerRead).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.get()).toBeInstanceOf(CryptoKey);
    expect(innerRead).toHaveBeenCalledTimes(2);

    jest.useFakeTimers();
  });
});
