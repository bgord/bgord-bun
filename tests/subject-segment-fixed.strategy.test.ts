import { describe, expect, test } from "bun:test";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";

describe("SubjectSegmentFixedStrategy", () => {
  test("happy path", () => {
    expect(new SubjectSegmentFixedStrategy("rate_limit").create()).toEqual("rate_limit");
  });
});
