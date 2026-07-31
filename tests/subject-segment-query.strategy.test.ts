import { describe, expect, test } from "bun:test";
import { SubjectSegmentQueryStrategy } from "../src/subject-segment-query.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new SubjectSegmentQueryStrategy();

describe("SubjectSegmentQueryStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withQuery({ aaa: "123", bbb: "234" }).build();

    expect(segment.create(context)).toEqual(`[["aaa",["123"]],["bbb",["234"]]]`);
  });

  test("empty", () => {
    const context = new RequestContextBuilder().build();

    expect(segment.create(context)).toEqual("__absent__");
  });

  test("order independence", () => {
    const first = new RequestContextBuilder().withQuery({ aaa: "1", bbb: "2" }).build();
    const second = new RequestContextBuilder().withQuery({ bbb: "2", aaa: "1" }).build();

    expect(segment.create(first)).toEqual(segment.create(second));
  });

  test("no collisions", () => {
    const encoded = new RequestContextBuilder().withQuery({ a: "b&c=d" }).build();
    const separate = new RequestContextBuilder().withQuery({ a: "b", c: "d" }).build();

    expect(segment.create(encoded)).not.toEqual(segment.create(separate));
  });

  test("do not drop repeated keys", () => {
    const repeated = new RequestContextBuilder().withQueries({ a: ["1", "2"] }).build();
    const single = new RequestContextBuilder().withQuery({ a: "1" }).build();

    expect(segment.create(repeated)).not.toEqual(segment.create(single));
  });
});
