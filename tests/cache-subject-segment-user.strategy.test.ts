import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentUserStrategy } from "../src/cache-subject-segment-user.strategy";

const segment = new CacheSubjectSegmentUserStrategy();

describe("CacheSubjectSegmentUserStrategy", () => {
  test("happy path", () => {
    const context = { get: () => ({ id: "123456789" }) };

    expect(segment.create(context as any)).toEqual(context.get().id);
  });

  test("empty", () => {
    const context = { get: () => null };

    expect(segment.create(context as any)).toEqual("anon");
  });

  test("no context", () => {
    expect(segment.create()).toEqual("anon");
  });
});
