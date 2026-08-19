import { describe, expect, test } from "bun:test";
import { CacheRepositoryNoopAdapter } from "../src/cache-repository-noop.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import * as testcase from "./testcases";

const value = "value";

const HashContent = new HashContentSha256Strategy();

describe("CacheRepositoryNoopAdapter", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("key")], {
    HashContent,
  });
  const subject = await resolver.resolve();
  const other = await new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("other")], {
    HashContent,
  }).resolve();

  test("get - null", async () => {
    const adapter = new CacheRepositoryNoopAdapter();

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("get - value", async () => {
    const adapter = new CacheRepositoryNoopAdapter();

    await adapter.set(subject.hex, value);

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("get - copy", async () => {
    const adapter = new CacheRepositoryNoopAdapter();
    const stored = { nested: { count: 1 } };

    await adapter.set(subject.hex, stored);

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("get - no mutation leak", async () => {
    const adapter = new CacheRepositoryNoopAdapter();

    await adapter.set(subject.hex, { count: 1 });

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("get - other subject", async () => {
    const adapter = new CacheRepositoryNoopAdapter();

    await adapter.set(subject.hex, value);

    expect(await adapter.get(other.hex)).toEqual(null);
  });

  test("set - overwrite", async () => {
    const adapter = new CacheRepositoryNoopAdapter();

    await adapter.set(subject.hex, "first");
    await adapter.set(subject.hex, "second");

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("set - failure", async () => {
    const adapter = new CacheRepositoryNoopAdapter();

    await adapter.set(subject.hex, value);

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("delete", async () => {
    const adapter = new CacheRepositoryNoopAdapter();

    await adapter.set(subject.hex, value);
    await adapter.delete(subject.hex);

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("flush", async () => {
    const adapter = new CacheRepositoryNoopAdapter();

    await adapter.set(subject.hex, value);
    await adapter.flush();

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  for (const { name, value } of testcase.cacheValues) {
    test(`round trip - ${name}`, async () => {
      const adapter = new CacheRepositoryNoopAdapter();

      await adapter.set(subject.hex, value);

      expect(await adapter.get(subject.hex)).toEqual(null);
    });
  }
});
