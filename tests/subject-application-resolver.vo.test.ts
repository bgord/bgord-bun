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
      Hash.fromString("1f58b9145b24d108d7ac38887338b3ea3229833b9c1e418250343f907bfd1047"),
    );
  });

  test("two fixed", async () => {
    const result = await new SubjectApplicationResolver([request, response], deps).resolve();

    expect(result.raw).toEqual(["request", "response"]);
    expect(result.hex).toEqual(
      Hash.fromString("d5d717a32f2180dede356b4091bee495571e2f76d77af225e2197a26eaebd92f"),
    );
  });

  test("fixed, env", async () => {
    const result = await new SubjectApplicationResolver([request, env], deps).resolve();

    expect(result.raw).toEqual(["request", NodeEnvironmentEnum.production]);
    expect(result.hex).toEqual(
      Hash.fromString("82bbdcacdea5d8a4c9905184eb6e074a6af199b7bdb56f1f7e2dee7e4cbfcc75"),
    );
  });

  test("fixed, env, build", async () => {
    const result = await new SubjectApplicationResolver([request, env, build], deps).resolve();

    expect(result.raw).toEqual(["request", NodeEnvironmentEnum.production, version.toString()]);
    expect(result.hex).toEqual(
      Hash.fromString("65222d61acd8176553ac178a7aff938b956f7bc1176a4df2b7658762b4531db1"),
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

  test("sanitization", async () => {
    const fixed = new SubjectSegmentFixedStrategy("a|b|c|");

    const result = await new SubjectApplicationResolver([fixed], deps).resolve();

    expect(result.raw).toEqual(["a%7Cb%7Cc%7C"]);
    expect(result.hex).toEqual(
      Hash.fromString("8525434b92846688a55d7bd14ae4fb3d2bb7650b77c3d69f87eb8f4fb5683068"),
    );
  });
});
