import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheSubjectResolver } from "../src/cache-subject-resolver.vo";
import { CacheSubjectSegmentFixed } from "../src/cache-subject-segment-fixed";
import { ContentHashSha256BunAdapter } from "../src/content-hash-sha256-bun.adapter";

const value = "value";
const config = { ttl: tools.Duration.Hours(1) };
const ContentHash = new ContentHashSha256BunAdapter();
const resolver = new CacheSubjectResolver([new CacheSubjectSegmentFixed("key")], { ContentHash });

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

  test("ttl expiration", async () => {
    jest.useFakeTimers();
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(subject.hex, "value");
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.Seconds(1)).ms);

    expect(await adapter.get(subject.hex)).toEqual(null);

    jest.useRealTimers();
  });

  test("get ttl", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    expect(adapter.ttl).toEqual(config.ttl);
  });
});
