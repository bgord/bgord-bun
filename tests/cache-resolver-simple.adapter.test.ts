import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNoopAdapter } from "../src/cache-repository-noop.adapter";
import { CacheSourceEnum } from "../src/cache-resolver.port";
import { CacheResolverSimpleAdapter } from "../src/cache-resolver-simple.adapter";
import { CacheSubjectResolver } from "../src/cache-subject-resolver.vo";
import { CacheSubjectSegmentFixed } from "../src/cache-subject-segment-fixed";
import * as mocks from "./mocks";

const cached = "cached-value";
const fresh = "fresh-value";
const config = { ttl: tools.Duration.Hours(1) };
const resolver = new CacheSubjectResolver([new CacheSubjectSegmentFixed("key")]);
const subject = resolver.resolve({} as any);

describe("CacheResolverSimpleAdapter", () => {
  test("success - hit", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const getSpy = spyOn(CacheRepository, "get").mockResolvedValue(cached);

    const result = await CacheResolver.resolve(subject.hex, async () => fresh);

    expect(result).toEqual(cached);
    expect(getSpy).toHaveBeenCalledWith("key");
  });

  test("success - miss", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const setSpy = spyOn(CacheRepository, "set");

    const result = await CacheResolver.resolve(subject.hex, async () => fresh);

    expect(result).toEqual(fresh);
    expect(setSpy).toHaveBeenCalledWith("key", fresh);
  });

  test("failure - error propagation", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const setSpy = spyOn(CacheRepository, "set");

    expect(async () =>
      CacheResolver.resolve(subject.hex, async () => {
        throw new Error(mocks.IntentionalError);
      }),
    ).toThrow(mocks.IntentionalError);
    expect(setSpy).not.toHaveBeenCalled();
  });

  test("resolveWithContext - hit", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const getSpy = spyOn(CacheRepository, "get").mockResolvedValue(cached);

    const result = await CacheResolver.resolveWithContext(subject.hex, async () => fresh);

    expect(result).toEqual({ value: cached, source: CacheSourceEnum.hit });
    expect(getSpy).toHaveBeenCalledWith("key");
  });

  test("resolveWithContext - miss", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const setSpy = spyOn(CacheRepository, "set");

    const result = await CacheResolver.resolveWithContext(subject.hex, async () => fresh);

    expect(result).toEqual({ value: fresh, source: CacheSourceEnum.miss });
    expect(setSpy).toHaveBeenCalledWith("key", fresh);
  });

  test("flush", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter(config);
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
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
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });

    expect(CacheResolver.ttl).toEqual(config.ttl);
  });
});
