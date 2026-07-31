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

    expect(result.raw).toEqual([["fixed", "request"]]);
    expect(result.hex).toEqual(
      Hash.fromString("e3d06b9edd360d43783f602c8e520a48e78437648c625cbf7be9095683079858"),
    );
  });

  test("two fixed", async () => {
    const result = await new SubjectApplicationResolver([request, response], deps).resolve();

    expect(result.raw).toEqual([
      ["fixed", "request"],
      ["fixed", "response"],
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("fbc7d9e4b276bdd49e392796d4a30bb752a1a0c9b4e18906a8f13765483f7da5"),
    );
  });

  test("fixed, env", async () => {
    const result = await new SubjectApplicationResolver([request, env], deps).resolve();

    expect(result.raw).toEqual([
      ["fixed", "request"],
      ["env", NodeEnvironmentEnum.production],
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("89d36fcd40f1744d135861c092aef088185159fe7da9db85753b7fe753dfd969"),
    );
  });

  test("fixed, env, build", async () => {
    const result = await new SubjectApplicationResolver([request, env, build], deps).resolve();

    expect(result.raw).toEqual([
      ["fixed", "request"],
      ["env", NodeEnvironmentEnum.production],
      ["build", version.toString()],
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("435878fe5af32044c66ee3fc54cb8fafe76417bb80aa714ebd5d5222f25b6ed1"),
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
