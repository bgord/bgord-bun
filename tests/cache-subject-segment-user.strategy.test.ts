import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentUserStrategy } from "../src/cache-subject-segment-user.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new CacheSubjectSegmentUserStrategy();

describe("CacheSubjectSegmentUserStrategy", () => {
  test("happy path", () => {
    const userId = "123456789";
    const context = new RequestContextBuilder().withUserId(userId).build();

    expect(segment.create(context)).toEqual(userId);
  });

  test("empty", () => {
    const context = new RequestContextBuilder().withUserId(undefined).build();

    expect(segment.create(context)).toEqual("anon");
  });
});
