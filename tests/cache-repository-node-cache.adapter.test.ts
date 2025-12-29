import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheSubjectResolver } from "../src/cache-subject-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";

const value = "value";
const config = { type: "finite", ttl: tools.Duration.Hours(1) } as const;

const HashContent = new HashContentSha256BunStrategy();

const resolver = new CacheSubjectResolver([new CacheSubjectSegmentFixedStrategy("key")], { HashContent });

describe("CacheRepositoryNodeCacheAdapter", async () => {
  const subject = await resolver.resolve();

  test("get - null", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("get - value", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);
    const value = "secret";

    await adapter.set(subject.hex, value);

    expect(await adapter.get<string>(subject.hex)).toEqual(value);
  });

  test("delete", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(subject.hex, value);

    expect(await adapter.get<string>(subject.hex)).toEqual(value);

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

    expect(await adapter.get<string>(subject.hex)).toEqual(value);

    jest.useRealTimers();
  });
});
