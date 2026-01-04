import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentEmpty } from "../src/cache-subject-segment.strategy";
import { CacheSubjectSegmentQueryStrategy } from "../src/cache-subject-segment-query.strategy";

const segment = new CacheSubjectSegmentQueryStrategy();

describe("CacheSubjectSegmentQueryStrategy", () => {
  test("happy path", () => {
    const context = { req: { query: () => ({ aaa: "123", bbb: "234" }) } } as any;

    expect(segment.create(context)).toEqual("aaa=123&bbb=234");
  });

  test("empty", () => {
    const context = { req: { query: () => ({}) } } as any;

    expect(segment.create(context)).toEqual(CacheSubjectSegmentEmpty);
  });

  test("no context", () => {
    expect(segment.create()).toEqual(CacheSubjectSegmentEmpty);
  });
});
