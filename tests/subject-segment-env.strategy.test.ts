import { describe, expect, test } from "bun:test";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { SubjectSegmentEnvStrategy } from "../src/subject-segment-env.strategy";

describe("SubjectSegmentEnvStrategy", () => {
  test("happy path", () => {
    expect(new SubjectSegmentEnvStrategy(NodeEnvironmentEnum.local).create()).toEqual(
      NodeEnvironmentEnum.local,
    );
  });
});
