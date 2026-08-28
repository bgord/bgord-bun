import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { Hash } from "../src/hash.vo";
import { IdempotencyStoreCacheAdapter } from "../src/idempotency-store-cache.adapter";

const config = { type: "finite", ttl: tools.Duration.Hours(1) } as const;

const primary = Hash.fromString("a".repeat(64));
const other = Hash.fromString("b".repeat(64));

describe("IdempotencyStoreCacheAdapter", () => {
  test("register - first time", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    const adapter = new IdempotencyStoreCacheAdapter({ CacheRepository });

    expect(await adapter.register(primary)).toEqual(true);
  });

  test("register - replay", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    const adapter = new IdempotencyStoreCacheAdapter({ CacheRepository });

    await adapter.register(primary);

    expect(await adapter.register(primary)).toEqual(false);
  });

  test("register - other subject", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    const adapter = new IdempotencyStoreCacheAdapter({ CacheRepository });

    await adapter.register(primary);

    expect(await adapter.register(other)).toEqual(true);
  });

  test("register - after ttl", async () => {
    jest.useFakeTimers();
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    const adapter = new IdempotencyStoreCacheAdapter({ CacheRepository });

    await adapter.register(primary);
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.register(primary)).toEqual(true);

    jest.useRealTimers();
  });

  test("register - within ttl", async () => {
    jest.useFakeTimers();
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    const adapter = new IdempotencyStoreCacheAdapter({ CacheRepository });

    await adapter.register(primary);
    jest.advanceTimersByTime(tools.Duration.Minutes(59).ms);

    expect(await adapter.register(primary)).toEqual(false);

    jest.useRealTimers();
  });
});
