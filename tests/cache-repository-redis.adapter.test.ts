import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { CacheRepositoryTtlType } from "../src/cache-repository.port";
import { CacheRepositoryRedisAdapter } from "../src/cache-repository-redis.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";

const HashContent = new HashContentSha256Strategy();
const config: CacheRepositoryTtlType = { type: "finite", ttl: tools.Duration.Hours(1) };

const client = {
  get: async (_key: string): Promise<string | null> => null,
  set: async (_key: string, _value: string): Promise<void> => {},
  del: async (_key: string): Promise<void> => {},
  expire: async (_key: string, _seconds: number): Promise<void> => {},
  send: async (..._args: Array<unknown>): Promise<void> => {},
} as any;

describe("CacheRepositoryRedisAdapter", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("key")], { HashContent });
  const subject = await resolver.resolve();

  test("get - null", async () => {
    using _ = spyOn(client, "get").mockResolvedValue(null);
    using parse = spyOn(JSON, "parse");
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    expect(await adapter.get(subject.hex)).toEqual(null);
    expect(parse).not.toHaveBeenCalled();
  });

  test("get - value", async () => {
    const value = "secret";
    using _ = spyOn(client, "get").mockResolvedValue(JSON.stringify(value));
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    expect(await adapter.get<string>(subject.hex)).toEqual(value);
  });

  test("set - finite ttl", async () => {
    using set = spyOn(client, "set");
    using expire = spyOn(client, "expire");
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    await adapter.set(subject.hex, "value");

    expect(set).toHaveBeenCalledWith(subject.hex.get(), JSON.stringify("value"));
    expect(expire).toHaveBeenCalledWith(subject.hex.get(), config.ttl.seconds);
  });

  test("set - infinite ttl", async () => {
    using set = spyOn(client, "set");
    using expire = spyOn(client, "expire");
    const adapter = new CacheRepositoryRedisAdapter(client, { type: "infinite" });

    await adapter.set(subject.hex, "value");

    expect(set).toHaveBeenCalledWith(subject.hex.get(), JSON.stringify("value"));
    expect(expire).not.toHaveBeenCalled();
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

    expect(send).toHaveBeenCalledWith("FLUSHALL", []);
  });
});
