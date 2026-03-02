import { describe, expect, test } from "bun:test";
import { SubjectSegmentPathStrategy } from "../src/subject-segment-path.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new SubjectSegmentPathStrategy();

describe("SubjectSegmentPathStrategy", () => {
  test("happy path", () => {
    const path = "/about";
    const context = new RequestContextBuilder().withPath(path).build();

    expect(segment.create(context)).toEqual(path);
  });
});
