import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentIp } from "../src/cache-subject-segment-ip";
import * as mocks from "./mocks";

const segment = new CacheSubjectSegmentIp();

describe("CacheSubjectSegmentIp", () => {
  test("happy path", () => {
    const context = { env: mocks.ip, req: { raw: {}, header: () => "anon" } } as any;

    expect(segment.create(context as any)).toEqual("anon");
  });

  test("no context", () => {
    expect(segment.create()).toEqual("");
  });
});
