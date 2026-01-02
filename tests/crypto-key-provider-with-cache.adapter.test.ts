import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheSubjectResolver } from "../src/cache-subject-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
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
    const cacheResolverResolve = spyOn(CacheResolver, "resolve");
    const resolver = new CacheSubjectResolver(
      [
        new CacheSubjectSegmentFixedStrategy("crypto_key_provider"),
        new CacheSubjectSegmentFixedStrategy("crypto-key"),
      ],
      deps,
    );
    const subject = await resolver.resolve();

    expect(await adapter.get()).toBeInstanceOf(CryptoKey);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve.mock.calls[0][0]).toEqual(subject.hex);

    expect(await adapter.get()).toBeInstanceOf(CryptoKey);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve.mock.calls[1][0]).toEqual(subject.hex);

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.get()).toBeInstanceOf(CryptoKey);
    expect(innerRead).toHaveBeenCalledTimes(2);
    expect(cacheResolverResolve.mock.calls[2][0]).toEqual(subject.hex);

    jest.useFakeTimers();
  });
});
