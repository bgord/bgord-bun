import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import * as mocks from "./mocks";

const value = "value";
const config = { type: "finite", ttl: tools.Duration.Hours(1) } as const;

const HashContent = new HashContentSha256Strategy();

describe("CacheRepositoryNodeCacheAdapter", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("key")], {
    HashContent,
  });
  const subject = await resolver.resolve();

  test("get - null", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("get - value", async () => {
    const value = "secret";
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(subject.hex, value);

    expect(await adapter.get(subject.hex)).toEqual(value);
  });

  test("get - copy", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);
    const stored = { nested: { count: 1 } };

    await adapter.set(subject.hex, stored);

    const cached = await adapter.get(subject.hex);

    expect(cached).toEqual(stored);
    expect(cached).not.toBe(stored);
  });

  test("get - no mutation leak", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(subject.hex, { count: 1 });

    const first = await adapter.get(subject.hex);
    (first as { count: number }).count = 2;

    expect(await adapter.get(subject.hex)).toEqual({ count: 1 });
  });

  test("set - full cache", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);
    using storeSet = spyOn(adapter["store"], "set").mockImplementation(mocks.throwIntentionalError);

    await adapter.set(subject.hex, value);

    expect(await adapter.get(subject.hex)).toEqual(null);
    expect(storeSet).toHaveBeenCalled();
  });

  test("delete", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(subject.hex, value);

    expect(await adapter.get(subject.hex)).toEqual(value);

    await adapter.delete(subject.hex);

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("flush", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(subject.hex, value);
    await adapter.flush();

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("ttl expiration - finite", async () => {
    jest.useFakeTimers();
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(subject.hex, value);
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.get(subject.hex)).toEqual(null);

    jest.useRealTimers();
  });

  test("ttl expiration - infinite", async () => {
    jest.useFakeTimers();
    const adapter = new CacheRepositoryNodeCacheAdapter({ type: "infinite" });

    await adapter.set(subject.hex, value);
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.get(subject.hex)).toEqual(value);

    jest.useRealTimers();
  });
});
