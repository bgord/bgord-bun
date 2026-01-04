import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentUserStrategy } from "../src/cache-subject-segment-user.strategy";

const segment = new CacheSubjectSegmentUserStrategy();

describe("CacheSubjectSegmentUserStrategy", () => {
  test("happy path", () => {
    const context = { get: () => ({ id: "123456789" }) } as any;

    expect(segment.create(context)).toEqual(context.get().id);
  });

  test("empty", () => {
    const context = { get: () => null } as any;

    expect(segment.create(context)).toEqual("anon");
  });

  test("no context", () => {
    expect(segment.create()).toEqual("anon");
  });
});
