import { describe, expect, test } from "bun:test";
import { SubjectSegmentHeaderStrategy } from "../src/subject-segment-header.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const name = "accept";
const value = "application/json";
const segment = new SubjectSegmentHeaderStrategy(name);

describe("SubjectSegmentHeaderStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withHeader(name, value).build();

    expect(segment.create(context)).toEqual(value);
  });

  test("empty", () => {
    const context = new RequestContextBuilder().build();

    expect(segment.create(context)).toEqual("__absent__");
  });
});
