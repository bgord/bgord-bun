import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNoopAdapter } from "../src/cache-repository-noop.adapter";
import { CacheSourceEnum } from "../src/cache-resolver.strategy";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheSubjectResolver } from "../src/cache-subject-resolver.vo";
import { CacheSubjectSegmentFixed } from "../src/cache-subject-segment-fixed";
import { HashContentSha256BunAdapter } from "../src/hash-content-sha256-bun.adapter";
import * as mocks from "./mocks";

const cached = "cached-value";
const fresh = "fresh-value";
const config = { ttl: tools.Duration.Hours(1) };

const HashContent = new HashContentSha256BunAdapter();
const deps = { HashContent };

const resolver = new CacheSubjectResolver([new CacheSubjectSegmentFixed("key")], deps);

describe("CacheResolverSimpleStrategy", async () => {
  const subject = await resolver.resolve();

  test("success - hit", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const getSpy = spyOn(CacheRepository, "get").mockResolvedValue(cached);

    const result = await CacheResolver.resolve(subject.hex, async () => fresh);

    expect(result).toEqual(cached);
    expect(getSpy).toHaveBeenCalledWith(subject.hex);
  });

  test("success - miss", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const setSpy = spyOn(CacheRepository, "set");

    const result = await CacheResolver.resolve(subject.hex, async () => fresh);

    expect(result).toEqual(fresh);
    expect(setSpy).toHaveBeenCalledWith(subject.hex, fresh);
  });

  test("failure - error propagation", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const setSpy = spyOn(CacheRepository, "set");

    expect(async () => CacheResolver.resolve(subject.hex, mocks.throwIntentionalErrorAsync)).toThrow(
      mocks.IntentionalError,
    );
    expect(setSpy).not.toHaveBeenCalled();
  });

  test("resolveWithContext - hit", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const getSpy = spyOn(CacheRepository, "get").mockResolvedValue(cached);

    const result = await CacheResolver.resolveWithContext(subject.hex, async () => fresh);

    expect(result).toEqual({ value: cached, source: CacheSourceEnum.hit });
    expect(getSpy).toHaveBeenCalledWith(subject.hex);
  });

  test("resolveWithContext - miss", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const setSpy = spyOn(CacheRepository, "set");

    const result = await CacheResolver.resolveWithContext(subject.hex, async () => fresh);

    expect(result).toEqual({ value: fresh, source: CacheSourceEnum.miss });
    expect(setSpy).toHaveBeenCalledWith(subject.hex, fresh);
  });

  test("flush", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
    const setSpy = spyOn(CacheRepository, "set");
    const flushSpy = spyOn(CacheRepository, "flush");

    const first = await CacheResolver.resolveWithContext(subject.hex, async () => fresh);

    expect(first).toEqual({ value: fresh, source: CacheSourceEnum.miss });
    expect(setSpy).toHaveBeenCalled();

    await CacheResolver.flush();

    expect(flushSpy).toHaveBeenCalled();
  });

  test("get ttl", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });

    expect(CacheResolver.ttl).toEqual(config.ttl);
  });
});
