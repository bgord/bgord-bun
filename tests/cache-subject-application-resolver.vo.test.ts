import { describe, expect, test } from "bun:test";
import { CacheSubjectApplicationResolver } from "../src/cache-subject-application-resolver.vo";
import { CacheSubjectSegmentEnvStrategy } from "../src/cache-subject-segment-env.strategy";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { Hash } from "../src/hash.vo";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const request = new CacheSubjectSegmentFixedStrategy("request");
const response = new CacheSubjectSegmentFixedStrategy("response");
const env = new CacheSubjectSegmentEnvStrategy(NodeEnvironmentEnum.production);

const HashContent = new HashContentSha256BunStrategy();
const deps = { HashContent };

describe("CacheSubjectApplicationResolver VO", () => {
  test("fixed", async () => {
    const result = await new CacheSubjectApplicationResolver([request], deps).resolve();

    expect(result.raw).toEqual(["request"]);
    expect(result.hex).toEqual(
      Hash.fromString("1f58b9145b24d108d7ac38887338b3ea3229833b9c1e418250343f907bfd1047"),
    );
  });

  test("two fixed", async () => {
    const result = await new CacheSubjectApplicationResolver([request, response], deps).resolve();

    expect(result.raw).toEqual(["request", "response"]);
    expect(result.hex).toEqual(
      Hash.fromString("d5d717a32f2180dede356b4091bee495571e2f76d77af225e2197a26eaebd92f"),
    );
  });

  test("fixed, env", async () => {
    const result = await new CacheSubjectApplicationResolver([request, env], deps).resolve();

    expect(result.raw).toEqual(["request", NodeEnvironmentEnum.production]);
    expect(result.hex).toEqual(
      Hash.fromString("82bbdcacdea5d8a4c9905184eb6e074a6af199b7bdb56f1f7e2dee7e4cbfcc75"),
    );
  });

  test("segments - empty", async () => {
    expect(async () => new CacheSubjectApplicationResolver([], deps).resolve()).toThrow(
      "cache.subject.application.no.segments",
    );
  });

  test("segments - too many", async () => {
    expect(async () =>
      new CacheSubjectApplicationResolver(
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
    ).toThrow("cache.subject.application.too.many.segments");
  });

  test("segments - at the limit", async () => {
    expect(async () =>
      new CacheSubjectApplicationResolver(
        [response, response, response, response, response, response, response, response, response, response],
        deps,
      ).resolve(),
    ).not.toThrow();
  });

  test("sanitization", async () => {
    const fixed = new CacheSubjectSegmentFixedStrategy("a|b|c|");

    const result = await new CacheSubjectApplicationResolver([fixed], deps).resolve();

    expect(result.raw).toEqual(["a%7Cb%7Cc%7C"]);
    expect(result.hex).toEqual(
      Hash.fromString("8525434b92846688a55d7bd14ae4fb3d2bb7650b77c3d69f87eb8f4fb5683068"),
    );
  });
});
