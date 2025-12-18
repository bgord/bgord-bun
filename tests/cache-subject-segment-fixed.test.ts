import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentFixed } from "../src/cache-subject-segment-fixed";

describe("CacheSubjectSegmentFixed", () => {
  test("happy path", () => {
    expect(new CacheSubjectSegmentFixed("rate_limit").create()).toEqual("rate_limit");
  });
});
