import { describe, expect, test } from "bun:test";
import { SubjectSegmentMethodStrategy } from "../src/subject-segment-method.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new SubjectSegmentMethodStrategy();

describe("SubjectSegmentMethodStrategy", () => {
  test("happy path", () => {
    const method = "POST";
    const context = new RequestContextBuilder().withMethod(method).build();

    expect(segment.create(context)).toEqual(method);
  });
});
