import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentPathStrategy } from "../src/cache-subject-segment-path.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new CacheSubjectSegmentPathStrategy();

describe("CacheSubjectSegmentPathStrategy", () => {
  test("happy path", () => {
    const path = "/about";
    const context = new RequestContextBuilder().withPath(path).build();

    expect(segment.create(context)).toEqual(path);
  });
});
