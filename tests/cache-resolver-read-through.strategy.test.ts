import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheCodecIdentityStrategy } from "../src/cache-codec-identity.strategy";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverReadThroughStrategy } from "../src/cache-resolver-read-through.strategy";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import * as mocks from "./mocks";

const cached = "cached-value";
const fresh = "fresh-value";
const config = { type: "finite", ttl: tools.Duration.Hours(1) } as const;

const HashContent = new HashContentSha256Strategy();
const codec = new CacheCodecIdentityStrategy<string>();
const deps = { HashContent };

describe("CacheResolverReadThroughStrategy", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("key")], deps);
  const subject = await resolver.resolve();

  test("success - hit", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    using cacheRepositoryGet = spyOn(CacheRepository, "get").mockResolvedValue(cached);
    const CacheResolver = new CacheResolverReadThroughStrategy({ CacheRepository });

    const result = await CacheResolver.resolve(subject.hex, async () => fresh, codec);

    expect(result).toEqual(cached);
    expect(cacheRepositoryGet).toHaveBeenCalledWith(subject.hex);
  });

  test("success - miss", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    using cacheRepositorySet = spyOn(CacheRepository, "set");
    const CacheResolver = new CacheResolverReadThroughStrategy({ CacheRepository });

    const result = await CacheResolver.resolve(subject.hex, async () => fresh, codec);

    expect(result).toEqual(fresh);
    expect(cacheRepositorySet).toHaveBeenCalledWith(subject.hex, fresh);
  });

  test("success - miss - unreachable repository", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    const CacheResolver = new CacheResolverReadThroughStrategy({ CacheRepository });
    using _ = spyOn(CacheRepository, "get").mockImplementation(mocks.throwIntentionalError);
    using cacheRepositorySet = spyOn(CacheRepository, "set");

    const result = await CacheResolver.resolve(subject.hex, async () => fresh, codec);

    expect(result).toEqual(fresh);
    expect(cacheRepositorySet).toHaveBeenCalledWith(subject.hex, fresh);
  });

  test("success - miss - undecodable entry", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    const failing = new CacheCodecIdentityStrategy<string>();
    using _ = spyOn(CacheRepository, "get").mockResolvedValue(cached);
    using __ = spyOn(failing, "decode").mockImplementation(mocks.throwIntentionalError);
    const CacheResolver = new CacheResolverReadThroughStrategy({ CacheRepository });

    const result = await CacheResolver.resolve(subject.hex, async () => fresh, failing);

    expect(result).toEqual(fresh);
  });

  test("failure - error propagation", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    using cacheRepositorySet = spyOn(CacheRepository, "set");
    const CacheResolver = new CacheResolverReadThroughStrategy({ CacheRepository });

    expect(async () => CacheResolver.resolve(subject.hex, mocks.throwIntentionalErrorAsync, codec)).toThrow(
      mocks.IntentionalError,
    );
    expect(cacheRepositorySet).not.toHaveBeenCalled();
  });

  test("flush", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    using cacheRepositorySet = spyOn(CacheRepository, "set");
    using cacheRepositoryFlush = spyOn(CacheRepository, "flush");
    const CacheResolver = new CacheResolverReadThroughStrategy({ CacheRepository });

    expect(await CacheResolver.resolve(subject.hex, async () => fresh, codec)).toEqual(fresh);
    expect(cacheRepositorySet).toHaveBeenCalled();

    await CacheResolver.flush();

    expect(cacheRepositoryFlush).toHaveBeenCalled();
  });

  test("ttl - infinite", async () => {
    jest.useFakeTimers();
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "infinite" });
    const CacheResolver = new CacheResolverReadThroughStrategy({ CacheRepository });

    const first = await CacheResolver.resolve(subject.hex, async () => fresh, codec);

    expect(first).toEqual(fresh);

    jest.advanceTimersByTime(config.ttl.add(tools.Duration.MIN).ms);

    const second = await CacheResolver.resolve(subject.hex, async () => fresh, codec);

    expect(second).toEqual(fresh);

    jest.useRealTimers();
  });
});
