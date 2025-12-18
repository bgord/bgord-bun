import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentPath } from "../src/cache-subject-segment-path";

const segment = new CacheSubjectSegmentPath();

describe("CacheSubjectSegmentPath", () => {
  test("happy path", () => {
    const context = { req: { path: "/about" } };

    expect(segment.create(context as any)).toEqual(context.req.path);
  });

  test("no context", () => {
    expect(segment.create()).toEqual("");
  });
});
