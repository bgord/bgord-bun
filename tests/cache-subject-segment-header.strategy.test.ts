import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentHeaderStrategy } from "../src/cache-subject-segment-header.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const name = "accept";
const value = "application/json";
const segment = new CacheSubjectSegmentHeaderStrategy(name);

describe("CacheSubjectSegmentHeaderStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withHeader(name, value).build();

    expect(segment.create(context)).toEqual(value);
  });

  test("empty", () => {
    const context = new RequestContextBuilder().build();

    expect(segment.create(context)).toEqual("__absent__");
  });
});
