import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentEmpty } from "../src/cache-subject-segment.strategy";
import { CacheSubjectSegmentHeaderStrategy } from "../src/cache-subject-segment-header.strategy";

const segment = new CacheSubjectSegmentHeaderStrategy("accept");

describe("CacheSubjectSegmentHeaderStrategy", () => {
  test("happy path", () => {
    const context = { req: { header: () => "application/json" } } as any;

    expect(segment.create(context)).toEqual(context.req.header());
  });

  test("empty", () => {
    const context = { req: { header: () => undefined } } as any;

    expect(segment.create(context)).toEqual(CacheSubjectSegmentEmpty);
  });

  test("no context", () => {
    expect(segment.create()).toEqual(CacheSubjectSegmentEmpty);
  });
});
