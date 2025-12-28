import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentCookieStrategy } from "../src/cache-subject-segment-cookie.strategy";

const segment = new CacheSubjectSegmentCookieStrategy("language");

describe("CacheSubjectSegmentCookieStrategy", () => {
  test("happy path", () => {
    const context = { req: { raw: { headers: new Headers({ cookie: "language=en" }) } } };

    expect(segment.create(context as any)).toEqual("en");
  });

  test("empty", () => {
    const context = { req: { raw: { headers: new Headers({}) } } };

    expect(segment.create(context as any)).toEqual("");
  });

  test("no context", () => {
    expect(segment.create()).toEqual("");
  });
});
