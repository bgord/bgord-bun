import { describe, expect, test } from "bun:test";
import { CacheRepositoryNoopAdapter } from "../src/cache-repository-noop.adapter";
import * as testcase from "./testcases";

const adapter = new CacheRepositoryNoopAdapter();

describe("CacheRepositoryNoopAdapter", async () => {
  const cases = await testcase.cacheRepository();
  const { primary, other } = cases.subjects;

  test(cases.getNull.name, async () => {
    expect(await adapter.get(primary)).toEqual(cases.getNull.output);
  });

  test(cases.getValue.name, async () => {
    await adapter.set(primary, cases.getValue.input);

    expect(await adapter.get(primary)).toEqual(null);
  });

  test(cases.getCopy.name, async () => {
    await adapter.set(primary, cases.getCopy.input);

    expect(await adapter.get(primary)).toEqual(null);
  });

  test(cases.getNoMutationLeak.name, async () => {
    await adapter.set(primary, cases.getNoMutationLeak.input);

    expect(await adapter.get(primary)).toEqual(null);
  });

  test(cases.getOtherSubject.name, async () => {
    await adapter.set(primary, cases.getOtherSubject.input);

    expect(await adapter.get(other)).toEqual(cases.getOtherSubject.output);
  });

  test(cases.setOverwrite.name, async () => {
    await adapter.set(primary, cases.setOverwrite.input.first);
    await adapter.set(primary, cases.setOverwrite.input.second);

    expect(await adapter.get(primary)).toEqual(null);
  });

  test(cases.setFailure.name, async () => {
    await adapter.set(primary, cases.setFailure.input);

    expect(await adapter.get(primary)).toEqual(cases.setFailure.output);
  });

  test(cases.delete.name, async () => {
    await adapter.set(primary, cases.delete.input);
    await adapter.delete(primary);

    expect(await adapter.get(primary)).toEqual(cases.delete.output);
  });

  test(cases.flush.name, async () => {
    await adapter.set(primary, cases.flush.input);
    await adapter.flush();

    expect(await adapter.get(primary)).toEqual(cases.flush.output);
  });

  for (const roundTrip of cases.roundTrips) {
    test(roundTrip.name, async () => {
      await adapter.set(primary, roundTrip.input);

      expect(await adapter.get(primary)).toEqual(null);
    });
  }
});
