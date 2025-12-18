import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentCookie } from "../src/cache-subject-segment-cookie";

describe("CacheSubjectSegmentCookie", () => {
  test("happy path", () => {
    const context = { req: { raw: { headers: new Headers({ cookie: "language=en" }) } } };

    expect(new CacheSubjectSegmentCookie("language").create(context as any)).toEqual("en");
  });

  test("empty", () => {
    const context = { req: { raw: { headers: new Headers({}) } } };

    expect(new CacheSubjectSegmentCookie("languge").create(context as any)).toEqual("");
  });
});
