import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentCookie } from "../src/cache-subject-segment-cookie";

const segment = new CacheSubjectSegmentCookie("language");

describe("CacheSubjectSegmentCookie", () => {
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
