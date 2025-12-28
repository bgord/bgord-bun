import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";

describe("CacheSubjectSegmentFixedStrategy", () => {
  test("happy path", () => {
    expect(new CacheSubjectSegmentFixedStrategy("rate_limit").create()).toEqual("rate_limit");
  });
});
