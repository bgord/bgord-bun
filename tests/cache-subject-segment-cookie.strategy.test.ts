import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentCookieStrategy } from "../src/cache-subject-segment-cookie.strategy";
import { CacheSubjectSegmentRequestEmpty } from "../src/cache-subject-segment-request.strategy";

const segment = new CacheSubjectSegmentCookieStrategy("language");

describe("CacheSubjectSegmentCookieStrategy", () => {
  test("happy path", () => {
    const context = { req: { raw: { headers: new Headers({ cookie: "language=en" }) } } } as any;

    expect(segment.create(context)).toEqual("en");
  });

  test("empty", () => {
    const context = { req: { raw: { headers: new Headers({}) } } } as any;

    expect(segment.create(context)).toEqual(CacheSubjectSegmentRequestEmpty);
  });
});
