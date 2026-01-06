import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentIpStrategy } from "../src/cache-subject-segment-ip.strategy";
import { ClientIp } from "../src/client-ip.vo";
import * as mocks from "./mocks";

const segment = new CacheSubjectSegmentIpStrategy();

describe("CacheSubjectSegmentIpStrategy", () => {
  test("happy path", () => {
    const context = { env: mocks.ip, req: { raw: {}, header: () => "anon" } } as any;

    expect(segment.create(context)).toEqual(ClientIp.parse("anon"));
  });
});
