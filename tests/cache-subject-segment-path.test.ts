import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentPath } from "../src/cache-subject-segment-path";

describe("CacheSubjectSegmentPath", () => {
  test("happy path", () => {
    const context = { req: { path: "/about" } };

    expect(new CacheSubjectSegmentPath().create(context as any)).toEqual(context.req.path);
  });
});
