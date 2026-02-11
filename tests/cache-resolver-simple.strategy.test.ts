import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheSourceEnum } from "../src/cache-resolver.strategy";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheSubjectApplicationResolver } from "../src/cache-subject-application-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import * as mocks from "./mocks";

const cached = "cached-value";
const fresh = "fresh-value";
const config = { type: "finite", ttl: tools.Duration.Hours(1) } as const;

const HashContent = new HashContentSha256Strategy();
const deps = { HashContent };

describe("CacheResolverSimpleStrategy", async () => {
  const resolver = new CacheSubjectApplicationResolver([new CacheSubjectSegmentFixedStrategy("key")], deps);
  const subject = await resolver.resolve();

  test("success - hit", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    using cacheRepositoryGet = spyOn(CacheRepository, "get").mockResolvedValue(cached);
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });

    const result = await CacheResolver.resolve(subject.hex, async () => fresh);

    expect(result).toEqual(cached);
    expect(cacheRepositoryGet).toHaveBeenCalledWith(subject.hex);
  });

  test("success - miss", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    using cacheRepositorySet = spyOn(CacheRepository, "set");
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });

    const result = await CacheResolver.resolve(subject.hex, async () => fresh);

    expect(result).toEqual(fresh);
    expect(cacheRepositorySet).toHaveBeenCalledWith(subject.hex, fresh);
  });

  test("failure - error propagation", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    using cacheRepositorySet = spyOn(CacheRepository, "set");
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });

    expect(async () => CacheResolver.resolve(subject.hex, mocks.throwIntentionalErrorAsync)).toThrow(
      mocks.IntentionalError,
    );
    expect(cacheRepositorySet).not.toHaveBeenCalled();
  });

  test("resolveWithContext - hit", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    using cacheRepositoryGet = spyOn(CacheRepository, "get").mockResolvedValue(cached);
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });

    const result = await CacheResolver.resolveWithContext(subject.hex, async () => fresh);

    expect(result).toEqual({ value: cached, source: CacheSourceEnum.hit });
    expect(cacheRepositoryGet).toHaveBeenCalledWith(subject.hex);
  });

  test("resolveWithContext - miss", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    using cacheRepositorySet = spyOn(CacheRepository, "set");
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });

    const result = await CacheResolver.resolveWithContext(subject.hex, async () => fresh);

    expect(result).toEqual({ value: fresh, source: CacheSourceEnum.miss });
    expect(cacheRepositorySet).toHaveBeenCalledWith(subject.hex, fresh);
  });

  test("flush", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    using cacheRepositorySet = spyOn(CacheRepository, "set");
    using cacheRepositoryFlush = spyOn(CacheRepository, "flush");
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });

    const first = await CacheResolver.resolveWithContext(subject.hex, async () => fresh);

    expect(first).toEqual({ value: fresh, source: CacheSourceEnum.miss });
    expect(cacheRepositorySet).toHaveBeenCalled();

    await CacheResolver.flush();

    expect(cacheRepositoryFlush).toHaveBeenCalled();
  });

  test("ttl - infinite", async () => {
    jest.useFakeTimers();
    const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "infinite" });
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });

    const first = await CacheResolver.resolve(subject.hex, async () => fresh);

    expect(first).toEqual(fresh);

    jest.advanceTimersByTime(config.ttl.add(tools.Duration.MIN).ms);

    const second = await CacheResolver.resolve(subject.hex, async () => fresh);

    expect(second).toEqual(fresh);

    jest.useRealTimers();
  });
});
