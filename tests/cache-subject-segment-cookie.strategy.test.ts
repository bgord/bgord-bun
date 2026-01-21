import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentCookieStrategy } from "../src/cache-subject-segment-cookie.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new CacheSubjectSegmentCookieStrategy("language");

describe("CacheSubjectSegmentCookieStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withCookie("language", "en").build();

    expect(segment.create(context)).toEqual("en");
  });

  test("empty", () => {
    const context = new RequestContextBuilder().build();

    expect(segment.create(context)).toEqual("__absent__");
  });
});
