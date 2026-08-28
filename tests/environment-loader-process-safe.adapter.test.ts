import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { EnvironmentLoaderProcessSafeAdapter } from "../src/environment-loader-process-safe.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import * as testcase from "./testcases";

const cases = testcase.environmentLoader();

const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl: tools.Duration.Hours(1) });

const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256Strategy();
const deps = { CacheResolver, HashContent };

describe("EnvironmentLoaderProcessSafe", () => {
  test(cases.happyPath.name, async () => {
    process.env["APP_NAME"] = cases.happyPath.input.APP_NAME;
    const env = { ...process.env, ...cases.happyPath.input };

    const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("env")], {
      HashContent,
    });
    using cacheResolverResolve = spyOn(CacheResolver, "resolve");
    const subject = await resolver.resolve();
    const adapter = new EnvironmentLoaderProcessSafeAdapter(env, cases.subjects.config, deps);

    const result = await adapter.load();

    expect(result).toEqual(cases.happyPath.output);
    expect(Object.isFrozen(result)).toEqual(true);
    expect(env["APP_NAME"]).toBeUndefined();
    expect(process.env["APP_NAME"]).toBeUndefined();
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(
      1,
      subject.hex,
      expect.any(Function),
      expect.any(Object),
    );

    const second = await adapter.load();

    expect(second).toEqual(cases.happyPath.output);
    expect(Object.isFrozen(second)).toEqual(true);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(
      2,
      subject.hex,
      expect.any(Function),
      expect.any(Object),
    );

    await CacheResolver.flush();
  });

  test(cases.failure.name, async () => {
    const adapter = new EnvironmentLoaderProcessSafeAdapter(
      // @ts-expect-error Changed schema assertion
      { ...process.env, ...cases.failure.input },
      cases.subjects.config,
      deps,
    );

    expect(async () => adapter.load()).toThrow(cases.failure.output);

    await CacheResolver.flush();
  });

  test(cases.failureAsyncSchema.name, async () => {
    const adapter = new EnvironmentLoaderProcessSafeAdapter(
      { ...process.env, ...cases.failureAsyncSchema.input },
      cases.subjects.asyncConfig,
      deps,
    );

    expect(async () => adapter.load()).toThrow(cases.failureAsyncSchema.output);
  });
});
