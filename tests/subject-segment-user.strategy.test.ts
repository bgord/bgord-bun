import { describe, expect, test } from "bun:test";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new SubjectSegmentUserStrategy();

describe("SubjectSegmentUserStrategy", () => {
  test("happy path", () => {
    const userId = "123456789";
    const context = new RequestContextBuilder().withUserId(userId).build();

    expect(segment.create(context)).toEqual(userId);
  });

  test("empty", () => {
    const context = new RequestContextBuilder().withUserId(undefined).build();

    expect(segment.create(context)).toEqual("__absent__");
  });
});
