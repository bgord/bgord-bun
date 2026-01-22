import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentIpStrategy } from "../src/cache-subject-segment-ip.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new CacheSubjectSegmentIpStrategy();

describe("CacheSubjectSegmentIpStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withIp("127.0.0.1").build();

    expect(segment.create(context)).toEqual("127.0.0.1");
  });

  test("missing", () => {
    const context = new RequestContextBuilder().build();

    expect(segment.create(context)).toEqual("__absent__");
  });
});
