import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheSubjectSegmentBuildStrategy } from "../src/cache-subject-segment-build.strategy";

const version = tools.PackageVersion.fromString("1.2.3");

describe("CacheSubjectSegmentBuildStrategy", () => {
  test("happy path", () => {
    expect(new CacheSubjectSegmentBuildStrategy(version).create()).toEqual(version.toString());
  });

  test("empty", () => {
    expect(new CacheSubjectSegmentBuildStrategy().create()).toEqual("__absent__");
  });
});
