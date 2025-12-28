import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentPathStrategy } from "../src/cache-subject-segment-path.strategy";

const segment = new CacheSubjectSegmentPathStrategy();

describe("CacheSubjectSegmentPathStrategy", () => {
  test("happy path", () => {
    const context = { req: { path: "/about" } };

    expect(segment.create(context as any)).toEqual(context.req.path);
  });

  test("no context", () => {
    expect(segment.create()).toEqual("");
  });
});
