import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentHeaderStrategy } from "../src/cache-subject-segment-header.strategy";

const segment = new CacheSubjectSegmentHeaderStrategy("accept");

describe("CacheSubjectSegmentHeaderStrategy", () => {
  test("happy path", () => {
    const context = { req: { header: () => "application/json" } };

    expect(segment.create(context as any)).toEqual(context.req.header());
  });

  test("empty", () => {
    const context = { req: { header: () => undefined } };

    expect(segment.create(context as any)).toEqual("");
  });

  test("no context", () => {
    expect(segment.create()).toEqual("");
  });
});
