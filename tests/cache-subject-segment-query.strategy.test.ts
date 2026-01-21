import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentQueryStrategy } from "../src/cache-subject-segment-query.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new CacheSubjectSegmentQueryStrategy();

describe("CacheSubjectSegmentQueryStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withQuery({ aaa: "123", bbb: "234" }).build();

    expect(segment.create(context)).toEqual("aaa=123&bbb=234");
  });

  test("empty", () => {
    const context = new RequestContextBuilder().build();

    expect(segment.create(context)).toEqual("__absent__");
  });
});
