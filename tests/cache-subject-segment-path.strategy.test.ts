import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentPathStrategy } from "../src/cache-subject-segment-path.strategy";

const segment = new CacheSubjectSegmentPathStrategy();

describe("CacheSubjectSegmentPathStrategy", () => {
  test("happy path", () => {
    const context = { req: { path: "/about" } } as any;

    expect(segment.create(context)).toEqual(context.req.path);
  });
});
