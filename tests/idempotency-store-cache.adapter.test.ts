import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { Hash } from "../src/hash.vo";
import { IdempotencyStoreCacheAdapter } from "../src/idempotency-store-cache.adapter";

const config = { type: "finite", ttl: tools.Duration.Hours(1) } as const;

const primary = Hash.fromString("a".repeat(64));
const other = Hash.fromString("b".repeat(64));

describe("IdempotencyStoreCacheAdapter", () => {
  test("claim - first time", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    const adapter = new IdempotencyStoreCacheAdapter({ CacheRepository });

    expect(await adapter.claim(primary)).toEqual(true);
    expect(await CacheRepository.get(primary)).toEqual(true);
  });

  test("claim - replay", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    const adapter = new IdempotencyStoreCacheAdapter({ CacheRepository });

    await adapter.claim(primary);

    expect(await adapter.claim(primary)).toEqual(false);
  });

  test("claim - other subject", async () => {
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    const adapter = new IdempotencyStoreCacheAdapter({ CacheRepository });

    await adapter.claim(primary);

    expect(await adapter.claim(other)).toEqual(true);
  });

  test("claim - after ttl", async () => {
    jest.useFakeTimers();
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    const adapter = new IdempotencyStoreCacheAdapter({ CacheRepository });

    await adapter.claim(primary);
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.claim(primary)).toEqual(true);

    jest.useRealTimers();
  });

  test("claim - within ttl", async () => {
    jest.useFakeTimers();
    const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
    const adapter = new IdempotencyStoreCacheAdapter({ CacheRepository });

    await adapter.claim(primary);
    jest.advanceTimersByTime(tools.Duration.Minutes(59).ms);

    expect(await adapter.claim(primary)).toEqual(false);

    jest.useRealTimers();
  });
});
