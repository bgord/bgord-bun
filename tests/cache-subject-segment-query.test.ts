import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentQuery } from "../src/cache-subject-segment-query";

describe("CacheSubjectSegmentQuery", () => {
  test("happy path", () => {
    const context = { req: { query: () => ({ aaa: "123", bbb: "234" }) } };

    expect(new CacheSubjectSegmentQuery().create(context as any)).toEqual("aaa=123&bbb=234");
  });

  test("empty", () => {
    const context = { req: { query: () => ({}) } };

    expect(new CacheSubjectSegmentQuery().create(context as any)).toEqual("");
  });
});
