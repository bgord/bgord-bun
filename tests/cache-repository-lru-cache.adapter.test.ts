import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryLruCacheAdapter } from "../src/cache-repository-lru-cache.adapter";
import { CacheSubjectResolver } from "../src/cache-subject-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import * as mocks from "./mocks";

const value = "value";
const config = { type: "finite", ttl: tools.Duration.Hours(1) } as const;

const HashContent = new HashContentSha256BunStrategy();

const resolver = new CacheSubjectResolver([new CacheSubjectSegmentFixedStrategy("key")], { HashContent });

describe("CacheRepositoryLruCacheAdapter", async () => {
  const subject = await resolver.resolve();

  test("get - null", async () => {
    const adapter = await CacheRepositoryLruCacheAdapter.build(config);

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("get - value", async () => {
    const adapter = await CacheRepositoryLruCacheAdapter.build(config);
    const value = "secret";

    await adapter.set(subject.hex, value);

    expect(await adapter.get<string>(subject.hex)).toEqual(value);
  });

  test("delete", async () => {
    const adapter = await CacheRepositoryLruCacheAdapter.build(config);

    await adapter.set(subject.hex, value);

    expect(await adapter.get<string>(subject.hex)).toEqual(value);

    await adapter.delete(subject.hex);

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("flush", async () => {
    const adapter = await CacheRepositoryLruCacheAdapter.build(config);

    await adapter.set(subject.hex, value);
    await adapter.flush();

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("ttl expiration", async () => {
    jest.useFakeTimers();
    spyOn(performance, "now").mockImplementation(() => Date.now());
    const adapter = await CacheRepositoryLruCacheAdapter.build(config);

    await adapter.set(subject.hex, value);

    expect(await adapter.get<string>(subject.hex)).toEqual(value);

    jest.advanceTimersByTime(config.ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.get(subject.hex)).toEqual(null);

    jest.useRealTimers();
  });

  test("ttl expiration - finite", async () => {
    jest.useFakeTimers();
    spyOn(performance, "now").mockImplementation(() => Date.now());
    const adapter = await CacheRepositoryLruCacheAdapter.build({ type: "infinite" });

    await adapter.set(subject.hex, value);
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.get<string>(subject.hex)).toEqual(value);

    jest.useRealTimers();
  });

  test("missing dependency", async () => {
    spyOn(CacheRepositoryLruCacheAdapter, "imports").mockRejectedValue(mocks.IntentionalError);

    expect(CacheRepositoryLruCacheAdapter.build(config)).rejects.toThrow(
      "cache.repository.lru.cache.adapter.error.missing.dependency",
    );
  });
});
