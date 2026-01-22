import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheSubjectApplicationResolver } from "../src/cache-subject-application-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { CryptoKeyProviderNoopAdapter } from "../src/crypto-key-provider-noop.adapter";
import { CryptoKeyProviderWithCacheAdapter } from "../src/crypto-key-provider-with-cache.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";

const inner = new CryptoKeyProviderNoopAdapter();

const ttl = tools.Duration.Minutes(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
const HashContent = new HashContentSha256Strategy();
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const deps = { CacheResolver, HashContent };

const adapter = new CryptoKeyProviderWithCacheAdapter({ id: "crypto-key", inner }, deps);

describe("CryptoKeyProviderWithCacheAdapter", () => {
  test("happy path", async () => {
    jest.useFakeTimers();
    const innerRead = spyOn(inner, "get");
    const cacheResolverResolve = spyOn(CacheResolver, "resolve");
    const resolver = new CacheSubjectApplicationResolver(
      [
        new CacheSubjectSegmentFixedStrategy("crypto_key_provider"),
        new CacheSubjectSegmentFixedStrategy("crypto-key"),
      ],
      deps,
    );
    const subject = await resolver.resolve();

    expect(await adapter.get()).toBeInstanceOf(CryptoKey);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(1, subject.hex, expect.any(Function));

    expect(await adapter.get()).toBeInstanceOf(CryptoKey);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(2, subject.hex, expect.any(Function));

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.get()).toBeInstanceOf(CryptoKey);
    expect(innerRead).toHaveBeenCalledTimes(2);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(3, subject.hex, expect.any(Function));

    jest.useFakeTimers();
  });
});
