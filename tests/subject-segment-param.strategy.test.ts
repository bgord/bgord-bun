import { describe, expect, test } from "bun:test";
import { SubjectSegmentParamStrategy } from "../src/subject-segment-param.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const param = "id";
const value = "123";
const segment = new SubjectSegmentParamStrategy(param);

describe("SubjectSegmentParamStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withParams({ [param]: value }).build();

    expect(segment.create(context)).toEqual(value);
  });

  test("missing", () => {
    const context = new RequestContextBuilder().build();

    expect(segment.create(context)).toEqual("__absent__");
  });
});
