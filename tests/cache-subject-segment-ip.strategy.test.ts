import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentIpStrategy } from "../src/cache-subject-segment-ip.strategy";
import * as mocks from "./mocks";

const segment = new CacheSubjectSegmentIpStrategy();

describe("CacheSubjectSegmentIpStrategy", () => {
  test("happy path", () => {
    const context = { env: mocks.ip, req: { raw: {}, header: () => "anon" } } as any;

    expect(segment.create(context as any)).toEqual("anon");
  });

  test("no context", () => {
    expect(segment.create()).toEqual("");
  });
});
