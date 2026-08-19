import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const config = { type: "finite", ttl: tools.Duration.Hours(1) } as const;

describe("CacheRepositoryNodeCacheAdapter", async () => {
  const cases = await testcase.cacheRepository();

  test(cases.getNull.name, async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.getNull.output);
  });

  test(cases.getValue.name, async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(cases.subjects.primary, cases.getValue.input);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.getValue.output);
  });

  test(cases.getCopy.name, async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(cases.subjects.primary, cases.getCopy.input);

    const cached = await adapter.get(cases.subjects.primary);

    expect(cached).toEqual(cases.getCopy.output);
    expect(cached).not.toBe(cases.getCopy.input);
  });

  test(cases.getNoMutationLeak.name, async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(cases.subjects.primary, cases.getNoMutationLeak.input);

    expect(await adapter.get(cases.subjects.primary)).not.toBe(await adapter.get(cases.subjects.primary));
  });

  test(cases.getOtherSubject.name, async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(cases.subjects.primary, cases.getOtherSubject.input);

    expect(await adapter.get(cases.subjects.other)).toEqual(cases.getOtherSubject.output);
  });

  test(cases.setOverwrite.name, async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(cases.subjects.primary, cases.setOverwrite.input.first);
    await adapter.set(cases.subjects.primary, cases.setOverwrite.input.second);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.setOverwrite.output);
  });

  test(cases.setFailure.name, async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);
    using storeSet = spyOn(adapter["store"], "set").mockImplementation(mocks.throwIntentionalError);

    await adapter.set(cases.subjects.primary, cases.setFailure.input);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.setFailure.output);
    expect(storeSet).toHaveBeenCalled();
  });

  test(cases.delete.name, async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(cases.subjects.primary, cases.delete.input);
    await adapter.delete(cases.subjects.primary);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.delete.output);
  });

  test(cases.deleteFailure.name, async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);
    using storeDel = spyOn(adapter["store"], "del").mockImplementation(mocks.throwIntentionalError);

    await adapter.set(cases.subjects.primary, cases.deleteFailure.input);

    expect(async () => adapter.delete(cases.subjects.primary)).toThrow(mocks.IntentionalError);
    expect(storeDel).toHaveBeenCalled();
  });

  test(cases.flush.name, async () => {
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(cases.subjects.primary, cases.flush.input);
    await adapter.flush();

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.flush.output);
  });

  test(cases.ttlFinite.name, async () => {
    jest.useFakeTimers();
    const adapter = new CacheRepositoryNodeCacheAdapter(config);

    await adapter.set(cases.subjects.primary, cases.ttlFinite.input);
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.ttlFinite.output);

    jest.useRealTimers();
  });

  test(cases.ttlInfinite.name, async () => {
    jest.useFakeTimers();
    const adapter = new CacheRepositoryNodeCacheAdapter({ type: "infinite" });

    await adapter.set(cases.subjects.primary, cases.ttlInfinite.input);
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.ttlInfinite.output);

    jest.useRealTimers();
  });

  for (const roundTrip of cases.roundTrips) {
    test(roundTrip.name, async () => {
      const adapter = new CacheRepositoryNodeCacheAdapter(config);

      await adapter.set(cases.subjects.primary, roundTrip.input);

      expect(await adapter.get(cases.subjects.primary)).toEqual(roundTrip.output);
    });
  }
});
