import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hash } from "../src/hash.vo";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentBuildStrategy } from "../src/subject-segment-build.strategy";
import { SubjectSegmentEnvStrategy } from "../src/subject-segment-env.strategy";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";

const request = new SubjectSegmentFixedStrategy("request");
const response = new SubjectSegmentFixedStrategy("response");
const env = new SubjectSegmentEnvStrategy(NodeEnvironmentEnum.production);

const version = tools.PackageVersion.fromString("1.2.3");
const build = new SubjectSegmentBuildStrategy(version);

const HashContent = new HashContentSha256Strategy();
const deps = { HashContent };

describe("SubjectApplicationResolver", () => {
  test("fixed", async () => {
    const result = await new SubjectApplicationResolver([request], deps).resolve();

    expect(result.raw).toEqual(["request"]);
    expect(result.hex).toEqual(
      Hash.fromString("a0cfbaaad23ecf3571470996e24f20c36e2b97d19682619de6a353f2bfa9b8e2"),
    );
  });

  test("two fixed", async () => {
    const result = await new SubjectApplicationResolver([request, response], deps).resolve();

    expect(result.raw).toEqual(["request", "response"]);
    expect(result.hex).toEqual(
      Hash.fromString("2229bc6a24359f2ccf0c9a70a2b1d246e51bba5df54bd8927f7aa3f5965e9b57"),
    );
  });

  test("fixed, env", async () => {
    const result = await new SubjectApplicationResolver([request, env], deps).resolve();

    expect(result.raw).toEqual(["request", NodeEnvironmentEnum.production]);
    expect(result.hex).toEqual(
      Hash.fromString("90382b2ba1f0b50b2ddb4248896229d668e75476b841a8d760cd21fb750b8581"),
    );
  });

  test("fixed, env, build", async () => {
    const result = await new SubjectApplicationResolver([request, env, build], deps).resolve();

    expect(result.raw).toEqual(["request", NodeEnvironmentEnum.production, version.toString()]);
    expect(result.hex).toEqual(
      Hash.fromString("36be7d57dd6e3131e73ec1964248412b65d7a1912f36a9f57c4fe393e19f4ed3"),
    );
  });

  test("segments - empty", async () => {
    expect(async () => new SubjectApplicationResolver([], deps).resolve()).toThrow(
      "subject.application.no.segments",
    );
  });

  test("segments - too many", async () => {
    expect(async () =>
      new SubjectApplicationResolver(
        [
          response,
          response,
          response,
          response,
          response,
          response,
          response,
          response,
          response,
          response,
          response,
        ],
        deps,
      ).resolve(),
    ).toThrow("subject.application.too.many.segments");
  });

  test("segments - at the limit", async () => {
    expect(async () =>
      new SubjectApplicationResolver(
        [response, response, response, response, response, response, response, response, response, response],
        deps,
      ).resolve(),
    ).not.toThrow();
  });
});
