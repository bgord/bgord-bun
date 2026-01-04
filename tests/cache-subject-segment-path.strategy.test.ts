import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentEmpty } from "../src/cache-subject-segment.strategy";
import { CacheSubjectSegmentPathStrategy } from "../src/cache-subject-segment-path.strategy";

const segment = new CacheSubjectSegmentPathStrategy();

describe("CacheSubjectSegmentPathStrategy", () => {
  test("happy path", () => {
    const context = { req: { path: "/about" } } as any;

    expect(segment.create(context)).toEqual(context.req.path);
  });

  test("no context", () => {
    expect(segment.create()).toEqual(CacheSubjectSegmentEmpty);
  });
});
