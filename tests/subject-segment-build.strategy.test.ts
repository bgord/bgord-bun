import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { SubjectSegmentBuildStrategy } from "../src/subject-segment-build.strategy";

const version = tools.PackageVersion.fromString("1.2.3");

describe("SubjectSegmentBuildStrategy", () => {
  test("happy path", () => {
    expect(new SubjectSegmentBuildStrategy(version).create()).toEqual(version.toString());
  });

  test("empty", () => {
    expect(new SubjectSegmentBuildStrategy().create()).toEqual("__absent__");
  });
});
