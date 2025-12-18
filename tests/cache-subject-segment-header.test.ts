import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentHeader } from "../src/cache-subject-segment-header";

describe("CacheSubjectSegmentHeader", () => {
  test("happy path", () => {
    const context = { req: { header: () => "application/json" } };

    expect(new CacheSubjectSegmentHeader("accept").create(context as any)).toEqual(context.req.header());
  });

  test("empty", () => {
    const context = { req: { header: () => undefined } };

    expect(new CacheSubjectSegmentHeader("accept").create(context as any)).toEqual("");
  });
});
