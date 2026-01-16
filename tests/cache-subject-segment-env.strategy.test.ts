import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentEnvStrategy } from "../src/cache-subject-segment-env.strategy";

describe("CacheSubjectSegmentEnvStrategy", () => {
  test("happy path", () => {
    expect(new CacheSubjectSegmentEnvStrategy("local").create()).toEqual("local");
  });
});
