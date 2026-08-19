// cspell:ignore setex
import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { CacheRepositoryTtlType } from "../src/cache-repository.port";
import { CacheRepositoryRedisAdapter } from "../src/cache-repository-redis.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const value = "value";

const HashContent = new HashContentSha256Strategy();
const config: CacheRepositoryTtlType = { type: "finite", ttl: tools.Duration.Hours(1) };

const client = {
  get: async (_key: string): Promise<string | null> => null,
  set: async (_key: string, _value: string): Promise<void> => {},
  setex: async (_key: string, _value: string): Promise<void> => {},
  del: async (_key: string): Promise<void> => {},
  expire: async (_key: string, _seconds: number): Promise<void> => {},
  send: async (..._args: Array<unknown>): Promise<void> => {},
} as any;

describe("CacheRepositoryRedisAdapter", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("key")], { HashContent });
  const subject = await resolver.resolve();
  const other = await new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("other")], {
    HashContent,
  }).resolve();

  test("get - null", async () => {
    using _ = spyOn(client, "get").mockResolvedValue(null);
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("get - value", async () => {
    using _ = spyOn(client, "get").mockResolvedValue(JSON.stringify(value));
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    expect(await adapter.get(subject.hex)).toEqual(value);
  });

  test("get - copy", async () => {
    const stored = { nested: { count: 1 } };
    using _ = spyOn(client, "get").mockResolvedValue(JSON.stringify(stored));
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    const cached = await adapter.get(subject.hex);

    expect(cached).toEqual(stored);
    expect(cached).not.toBe(stored);
  });

  test("get - no mutation leak", async () => {
    using _ = spyOn(client, "get").mockResolvedValue(JSON.stringify({ count: 1 }));
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    expect(await adapter.get(subject.hex)).not.toBe(await adapter.get(subject.hex));
  });

  test("get - other subject", async () => {
    using get = spyOn(client, "get").mockResolvedValue(null);
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    expect(await adapter.get(other.hex)).toEqual(null);
    expect(get).toHaveBeenCalledWith(other.hex.get());
  });

  test("set - overwrite", async () => {
    using setex = spyOn(client, "setex");
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    await adapter.set(subject.hex, "first");
    await adapter.set(subject.hex, "second");

    expect(setex).toHaveBeenLastCalledWith(
      subject.hex.get(),
      config.ttl.seconds,
      JSON.stringify("second"),
    );
  });

  test("set - failure", async () => {
    using setex = spyOn(client, "setex").mockImplementation(mocks.throwIntentionalError);
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    await adapter.set(subject.hex, value);

    expect(await adapter.get(subject.hex)).toEqual(null);
    expect(setex).toHaveBeenCalled();
  });

  test("delete", async () => {
    using del = spyOn(client, "del");
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    await adapter.delete(subject.hex);

    expect(del).toHaveBeenCalledWith(subject.hex.get());
  });

  test("flush", async () => {
    using send = spyOn(client, "send");
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    await adapter.flush();

    expect(send).toHaveBeenCalledWith("FLUSHDB", []);
  });

  test("ttl - finite", async () => {
    using setex = spyOn(client, "setex");
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    await adapter.set(subject.hex, value);

    expect(setex).toHaveBeenCalledWith(subject.hex.get(), config.ttl.seconds, JSON.stringify(value));
  });

  test("ttl - infinite", async () => {
    using set = spyOn(client, "set");
    using expire = spyOn(client, "expire");
    const adapter = new CacheRepositoryRedisAdapter(client, { type: "infinite" });

    await adapter.set(subject.hex, value);

    expect(set).toHaveBeenCalledWith(subject.hex.get(), JSON.stringify(value));
    expect(expire).not.toHaveBeenCalled();
  });

  for (const { name, value } of testcase.cacheValues) {
    test(`round trip - ${name}`, async () => {
      using setex = spyOn(client, "setex");
      const adapter = new CacheRepositoryRedisAdapter(client, config);

      await adapter.set(subject.hex, value);

      using _ = spyOn(client, "get").mockResolvedValue(setex.mock.calls[0]?.[2]);

      expect(await adapter.get(subject.hex)).toEqual(value);
    });
  }
});
