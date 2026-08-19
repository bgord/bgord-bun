// cspell:ignore setex
import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { CacheRepositoryTtlType } from "../src/cache-repository.port";
import { CacheRepositoryRedisAdapter } from "../src/cache-repository-redis.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

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
  const cases = await testcase.cacheRepository();

  test(cases.getNull.name, async () => {
    using _ = spyOn(client, "get").mockResolvedValue(null);
    using parse = spyOn(JSON, "parse");
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.getNull.output);
    expect(parse).not.toHaveBeenCalled();
  });

  test(cases.getValue.name, async () => {
    using _ = spyOn(client, "get").mockResolvedValue(JSON.stringify(cases.getValue.input));
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.getValue.output);
  });

  test(cases.getCopy.name, async () => {
    using _ = spyOn(client, "get").mockResolvedValue(JSON.stringify(cases.getCopy.input));
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    const cached = await adapter.get(cases.subjects.primary);

    expect(cached).toEqual(cases.getCopy.output);
    expect(cached).not.toBe(cases.getCopy.input);
  });

  test(cases.getNoMutationLeak.name, async () => {
    using _ = spyOn(client, "get").mockResolvedValue(JSON.stringify(cases.getNoMutationLeak.input));
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    expect(await adapter.get(cases.subjects.primary)).not.toBe(await adapter.get(cases.subjects.primary));
  });

  test(cases.getOtherSubject.name, async () => {
    using get = spyOn(client, "get").mockResolvedValue(null);
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    expect(await adapter.get(cases.subjects.other)).toEqual(cases.getOtherSubject.output);
    expect(get).toHaveBeenCalledWith(cases.subjects.other.get());
  });

  test(cases.setOverwrite.name, async () => {
    using setex = spyOn(client, "setex");
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    await adapter.set(cases.subjects.primary, cases.setOverwrite.input.first);
    await adapter.set(cases.subjects.primary, cases.setOverwrite.input.second);

    expect(setex).toHaveBeenLastCalledWith(
      cases.subjects.primary.get(),
      config.ttl.seconds,
      JSON.stringify(cases.setOverwrite.output),
    );
  });

  test(cases.setFailure.name, async () => {
    using setex = spyOn(client, "setex").mockImplementation(mocks.throwIntentionalError);
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    await adapter.set(cases.subjects.primary, cases.setFailure.input);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.setFailure.output);
    expect(setex).toHaveBeenCalled();
  });

  test(cases.delete.name, async () => {
    using del = spyOn(client, "del");
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    await adapter.delete(cases.subjects.primary);

    expect(del).toHaveBeenCalledWith(cases.subjects.primary.get());
    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.delete.output);
  });

  test(cases.deleteFailure.name, async () => {
    using del = spyOn(client, "del").mockImplementation(mocks.throwIntentionalError);
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    expect(async () => adapter.delete(cases.subjects.primary)).toThrow(mocks.IntentionalError);
    expect(del).toHaveBeenCalled();
  });

  test(cases.flush.name, async () => {
    using send = spyOn(client, "send");
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    await adapter.flush();

    expect(send).toHaveBeenCalledWith("FLUSHDB", []);
    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.flush.output);
  });

  test(cases.ttlFinite.name, async () => {
    using setex = spyOn(client, "setex");
    const adapter = new CacheRepositoryRedisAdapter(client, config);

    await adapter.set(cases.subjects.primary, cases.ttlFinite.input);

    expect(setex).toHaveBeenCalledWith(
      cases.subjects.primary.get(),
      config.ttl.seconds,
      JSON.stringify(cases.ttlFinite.input),
    );
  });

  test(cases.ttlInfinite.name, async () => {
    using set = spyOn(client, "set");
    using expire = spyOn(client, "expire");
    const adapter = new CacheRepositoryRedisAdapter(client, { type: "infinite" });

    await adapter.set(cases.subjects.primary, cases.ttlInfinite.input);

    expect(set).toHaveBeenCalledWith(cases.subjects.primary.get(), JSON.stringify(cases.ttlInfinite.output));
    expect(expire).not.toHaveBeenCalled();
  });

  for (const roundTrip of cases.roundTrips) {
    test(roundTrip.name, async () => {
      using setex = spyOn(client, "setex");
      const adapter = new CacheRepositoryRedisAdapter(client, config);

      await adapter.set(cases.subjects.primary, roundTrip.input);

      using _ = spyOn(client, "get").mockResolvedValue(setex.mock.calls[0]?.[2]);

      expect(await adapter.get(cases.subjects.primary)).toEqual(roundTrip.output);
    });
  }
});
