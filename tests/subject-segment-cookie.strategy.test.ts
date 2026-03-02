import { describe, expect, test } from "bun:test";
import { SubjectSegmentCookieStrategy } from "../src/subject-segment-cookie.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new SubjectSegmentCookieStrategy("language");

describe("SubjectSegmentCookieStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withCookie("language", "en").build();

    expect(segment.create(context)).toEqual("en");
  });

  test("empty", () => {
    const context = new RequestContextBuilder().build();

    expect(segment.create(context)).toEqual("__absent__");
  });
});
