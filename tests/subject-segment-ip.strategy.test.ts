import { describe, expect, test } from "bun:test";
import { SubjectSegmentIpStrategy } from "../src/subject-segment-ip.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new SubjectSegmentIpStrategy();

describe("SubjectSegmentIpStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withIp(mocks.ip).build();

    expect(segment.create(context)).toEqual(mocks.ip);
  });

  test("missing", () => {
    const context = new RequestContextBuilder().build();

    expect(segment.create(context)).toEqual("__absent__");
  });
});
