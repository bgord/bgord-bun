import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";

const key = "master-key";
const value = "value";
const config = { ttl: tools.Duration.Hours(1) };

describe("CacheRepositoryNodeCacheAdapter", () => {
  test("get - null", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    expect(await adapter.get(key)).toEqual(null);
  });

  test("get - value", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);
    const value = "secret";

    await adapter.set(key, value);

    expect(await adapter.get<string>(key)).toEqual(value);
  });

  test("delete", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(key, value);

    expect(await adapter.get<string>(key)).toEqual(value);

    await adapter.delete(key);

    expect(await adapter.get(key)).toEqual(null);
  });

  test("flush", async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(key, value);
    await adapter.flush();

    expect(await adapter.get(key)).toEqual(null);
  });

  test("ttl expiration", async () => {
    jest.useFakeTimers();
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set("key", "value");
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.Seconds(1)).ms);

    expect(await adapter.get("key")).toEqual(null);

    jest.useRealTimers();
  });
});
