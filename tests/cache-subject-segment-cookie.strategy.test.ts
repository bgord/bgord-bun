import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentEmpty } from "../src/cache-subject-segment.strategy";
import { CacheSubjectSegmentCookieStrategy } from "../src/cache-subject-segment-cookie.strategy";

const segment = new CacheSubjectSegmentCookieStrategy("language");

describe("CacheSubjectSegmentCookieStrategy", () => {
  test("happy path", () => {
    const context = { req: { raw: { headers: new Headers({ cookie: "language=en" }) } } } as any;

    expect(segment.create(context)).toEqual("en");
  });

  test("empty", () => {
    const context = { req: { raw: { headers: new Headers({}) } } } as any;

    expect(segment.create(context)).toEqual(CacheSubjectSegmentEmpty);
  });

  test("no context", () => {
    expect(segment.create()).toEqual(CacheSubjectSegmentEmpty);
  });
});
