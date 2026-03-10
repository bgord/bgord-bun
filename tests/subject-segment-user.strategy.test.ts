import { describe, expect, test } from "bun:test";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new SubjectSegmentUserStrategy();

describe("SubjectSegmentUserStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withUserId(mocks.userId).build();

    expect(segment.create(context)).toEqual(mocks.userId);
  });

  test("empty", () => {
    const context = new RequestContextBuilder().withUserId(undefined).build();

    expect(segment.create(context)).toEqual("__absent__");
  });
});
