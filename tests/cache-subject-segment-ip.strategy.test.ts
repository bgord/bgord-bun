import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentIpStrategy } from "../src/cache-subject-segment-ip.strategy";
import { ClientIp } from "../src/client-ip.vo";
import { RequestContextBuilder } from "./request-context-builder";

const segment = new CacheSubjectSegmentIpStrategy();

describe("CacheSubjectSegmentIpStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withIp("anon").build();

    expect(segment.create(context)).toEqual(ClientIp.parse("anon"));
  });
});
