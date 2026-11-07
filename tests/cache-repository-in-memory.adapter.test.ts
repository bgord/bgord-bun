import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryInMemoryAdapter } from "../src/cache-repository-in-memory.adapter";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { Hash } from "../src/hash.vo";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const config = { type: "finite", ttl: tools.Duration.Hours(1) } as const;

describe("CacheRepositoryInMemoryAdapter", async () => {
  const cases = await testcase.cacheRepository();

  test(cases.getNull.name, async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.getNull.output);
  });

  test(cases.getValue.name, async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });

    await adapter.set(cases.subjects.primary, cases.getValue.input);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.getValue.output);
  });

  test(cases.getCopy.name, async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });

    await adapter.set(cases.subjects.primary, cases.getCopy.input);

    const cached = await adapter.get(cases.subjects.primary);

    expect(cached).toEqual(cases.getCopy.output);
    expect(cached).not.toBe(cases.getCopy.input);
  });

  test(cases.getNoMutationLeak.name, async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });

    await adapter.set(cases.subjects.primary, cases.getNoMutationLeak.input);

    expect(await adapter.get(cases.subjects.primary)).not.toBe(await adapter.get(cases.subjects.primary));
  });

  test(cases.getOtherSubject.name, async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });

    await adapter.set(cases.subjects.primary, cases.getOtherSubject.input);

    expect(await adapter.get(cases.subjects.other)).toEqual(cases.getOtherSubject.output);
  });

  test(cases.setOverwrite.name, async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });

    await adapter.set(cases.subjects.primary, cases.setOverwrite.input.first);
    await adapter.set(cases.subjects.primary, cases.setOverwrite.input.second);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.setOverwrite.output);
  });

  test(cases.setFailure.name, async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });
    using storeSet = spyOn(adapter["store"], "set").mockImplementation(mocks.throwIntentionalError);

    await adapter.set(cases.subjects.primary, cases.setFailure.input);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.setFailure.output);
    expect(storeSet).toHaveBeenCalled();
  });

  test(cases.delete.name, async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });

    await adapter.set(cases.subjects.primary, cases.delete.input);
    await adapter.delete(cases.subjects.primary);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.delete.output);
  });

  test(cases.deleteFailure.name, async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });
    using storeDel = spyOn(adapter["store"], "delete").mockImplementation(mocks.throwIntentionalError);

    await adapter.set(cases.subjects.primary, cases.deleteFailure.input);

    expect(async () => adapter.delete(cases.subjects.primary)).toThrow(mocks.IntentionalError);
    expect(storeDel).toHaveBeenCalled();
  });

  test(cases.flush.name, async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });

    await adapter.set(cases.subjects.primary, cases.flush.input);
    await adapter.flush();

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.flush.output);
  });

  test(cases.ttlFinite.name, async () => {
    jest.useFakeTimers();
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });

    await adapter.set(cases.subjects.primary, cases.ttlFinite.input);
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.ttlFinite.output);

    jest.useRealTimers();
  });

  test(cases.ttlInfinite.name, async () => {
    jest.useFakeTimers();
    const adapter = new CacheRepositoryInMemoryAdapter(
      { type: "infinite" },
      { Clock: new ClockSystemAdapter() },
    );

    await adapter.set(cases.subjects.primary, cases.ttlInfinite.input);
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.get(cases.subjects.primary)).toEqual(cases.ttlInfinite.output);

    jest.useRealTimers();
  });

  test("ttl - at boundary", async () => {
    jest.useFakeTimers();
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });
    await adapter.set(cases.subjects.primary, "value");

    jest.advanceTimersByTime(config.ttl.ms);

    expect(await adapter.get(cases.subjects.primary)).toEqual("value");

    jest.useRealTimers();
  });

  test("ttl - past boundary", async () => {
    jest.useFakeTimers();
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });
    await adapter.set(cases.subjects.primary, "value");

    jest.advanceTimersByTime(config.ttl.add(tools.Duration.Ms(1)).ms);

    expect(await adapter.get(cases.subjects.primary)).toEqual(null);

    jest.useRealTimers();
  });

  test("delete - missing", async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });
    await adapter.set(cases.subjects.primary, "value");

    await adapter.delete(cases.subjects.other);

    expect(await adapter.get(cases.subjects.primary)).toEqual("value");
  });

  test("flush - empty", async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });

    await adapter.flush();

    expect(await adapter.get(cases.subjects.primary)).toEqual(null);
  });

  test("cap - last key within cap", async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });
    for (let i = 0; i < 99_999; i++) {
      await adapter.set(Hash.fromString(i.toString(16).padStart(64, "0")), "value");
    }

    await adapter.set(cases.subjects.primary, "value");

    expect(await adapter.get(cases.subjects.primary)).toEqual("value");
  });

  test("cap - evicts oldest", async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });
    for (let i = 0; i < 100_000; i++) {
      await adapter.set(Hash.fromString(i.toString(16).padStart(64, "0")), "value");
    }

    await adapter.set(cases.subjects.primary, "value");

    expect(await adapter.get(cases.subjects.primary)).toEqual("value");
    expect(await adapter.get(Hash.fromString("0".repeat(64)))).toEqual(null);
  });

  test("cap - overwrite", async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });
    for (let i = 0; i < 100_000; i++) {
      await adapter.set(Hash.fromString(i.toString(16).padStart(64, "0")), "value");
    }

    await adapter.set(Hash.fromString("1".padStart(64, "0")), "second");

    expect(await adapter.get(Hash.fromString("1".padStart(64, "0")))).toEqual("second");
    expect(await adapter.get(Hash.fromString("0".repeat(64)))).toEqual("value");
  });

  test("cap - overwrite becomes newest", async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });
    for (let i = 0; i < 100_000; i++) {
      await adapter.set(Hash.fromString(i.toString(16).padStart(64, "0")), "value");
    }
    await adapter.set(Hash.fromString("1".padStart(64, "0")), "second");
    await adapter.set(cases.subjects.primary, "value");

    await adapter.set(cases.subjects.other, "value");

    expect(await adapter.get(Hash.fromString("1".padStart(64, "0")))).toEqual("second");
  });

  test("cap - after delete", async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });
    for (let i = 0; i < 100_000; i++) {
      await adapter.set(Hash.fromString(i.toString(16).padStart(64, "0")), "value");
    }
    await adapter.delete(Hash.fromString("0".repeat(64)));

    await adapter.set(cases.subjects.primary, "value");

    expect(await adapter.get(cases.subjects.primary)).toEqual("value");
  });

  test("cap - after flush", async () => {
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });
    for (let i = 0; i < 100_000; i++) {
      await adapter.set(Hash.fromString(i.toString(16).padStart(64, "0")), "value");
    }
    await adapter.flush();

    await adapter.set(cases.subjects.primary, "value");

    expect(await adapter.get(cases.subjects.primary)).toEqual("value");
  });

  test("cap - expired entries", async () => {
    jest.useFakeTimers();
    const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });
    for (let i = 0; i < 100_000; i++) {
      await adapter.set(Hash.fromString(i.toString(16).padStart(64, "0")), "value");
    }
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.Minutes(10)).ms);

    await adapter.set(cases.subjects.primary, "value");

    expect(await adapter.get(cases.subjects.primary)).toEqual("value");

    jest.useRealTimers();
  });

  for (const roundTrip of cases.roundTrips) {
    test(roundTrip.name, async () => {
      const adapter = new CacheRepositoryInMemoryAdapter(config, { Clock: new ClockSystemAdapter() });

      await adapter.set(cases.subjects.primary, roundTrip.input);

      expect(await adapter.get(cases.subjects.primary)).toEqual(roundTrip.output);
    });
  }
});
