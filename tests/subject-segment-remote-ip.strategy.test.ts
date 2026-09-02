import { describe, expect, test } from "bun:test";
import { SubjectSegmentRemoteIpStrategy } from "../src/subject-segment-remote-ip.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new SubjectSegmentRemoteIpStrategy();

describe("SubjectSegmentRemoteIpStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withRemoteIp(mocks.ip).build();

    expect(segment.create(context)).toEqual(mocks.ip);
    expect(segment.label).toEqual("remote-ip");
  });

  test("ignores the forwarded ip", () => {
    const context = new RequestContextBuilder().withIp("1.1.1.1").withRemoteIp(mocks.ip).build();

    expect(segment.create(context)).toEqual(mocks.ip);
  });

  test("missing", () => {
    const context = new RequestContextBuilder().build();

    expect(segment.create(context)).toEqual(null);
  });
});
