import { describe, expect, test } from "bun:test";
import { CacheSubjectSegmentEnvStrategy } from "../src/cache-subject-segment-env.strategy";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

describe("CacheSubjectSegmentEnvStrategy", () => {
  test("happy path", () => {
    expect(new CacheSubjectSegmentEnvStrategy(NodeEnvironmentEnum.local).create()).toEqual(
      NodeEnvironmentEnum.local,
    );
  });
});
