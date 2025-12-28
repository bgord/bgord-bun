import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentQueryStrategy } from "../src/cache-subject-segment-query.strategy";

const segment = new CacheSubjectSegmentQueryStrategy();

describe("CacheSubjectSegmentQueryStrategy", () => {
  test("happy path", () => {
    const context = { req: { query: () => ({ aaa: "123", bbb: "234" }) } };

    expect(segment.create(context as any)).toEqual("aaa=123&bbb=234");
  });

  test("empty", () => {
    const context = { req: { query: () => ({}) } };

    expect(segment.create(context as any)).toEqual("");
  });

  test("no context", () => {
    expect(segment.create()).toEqual("");
  });
});
