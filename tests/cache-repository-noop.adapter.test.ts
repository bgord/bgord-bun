import { describe, expect, test } from "bun:test";
import { CacheRepositoryNoopAdapter } from "../src/cache-repository-noop.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";

const adapter = new CacheRepositoryNoopAdapter();

const HashContent = new HashContentSha256Strategy();
const value = "value";

describe("CacheRepositoryNoopAdapter", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("key")], {
    HashContent,
  });
  const subject = await resolver.resolve();

  test("get - null", async () => {
    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("get - value", async () => {
    await adapter.set(subject.hex, value);

    expect(await adapter.get<string>(subject.hex)).toEqual(null);
  });

  test("delete", async () => {
    await adapter.set(subject.hex, value);

    expect(await adapter.get<string>(subject.hex)).toEqual(null);

    await adapter.delete(subject.hex);

    expect(await adapter.get(subject.hex)).toEqual(null);
  });

  test("flush", async () => {
    await adapter.set(subject.hex, value);
    await adapter.flush();

    expect(await adapter.get(subject.hex)).toEqual(null);
  });
});
