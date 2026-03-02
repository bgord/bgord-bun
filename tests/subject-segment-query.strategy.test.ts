import { describe, expect, test } from "bun:test";
import { SubjectSegmentQueryStrategy } from "../src/subject-segment-query.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new SubjectSegmentQueryStrategy();

describe("SubjectSegmentQueryStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withQuery({ aaa: "123", bbb: "234" }).build();

    expect(segment.create(context)).toEqual("aaa=123&bbb=234");
  });

  test("empty", () => {
    const context = new RequestContextBuilder().build();

    expect(segment.create(context)).toEqual("__absent__");
  });
});
