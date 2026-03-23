import { describe, expect, spyOn, test } from "bun:test";
import * as v from "valibot";
import { ApiVersionMiddleware } from "../src/api-version.middleware";
import { BuildInfoSchema } from "../src/build-info-repository.strategy";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { ReactiveConfigNoopAdapter } from "../src/reactive-config-noop.adapter";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import * as mocks from "./mocks";

const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "infinite" });
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256Strategy();
const BuildInfoConfig = new ReactiveConfigNoopAdapter(BuildInfoSchema, mocks.buildInfo);
const deps = { CacheResolver, HashContent, BuildInfoConfig };

const middleware = new ApiVersionMiddleware(deps);

describe("ApiVersionMiddleware", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("api-version")], deps);
  const subject = await resolver.resolve();

  test("happy path", async () => {
    using buildInfoRepositoryGet = spyOn(deps.BuildInfoConfig, "get");
    using cacheRepositoryget = spyOn(CacheRepository, "get");

    expect(await middleware.evaluate()).toEqual(v.parse(BuildInfoSchema.entries.version, mocks.version));
    expect(cacheRepositoryget).toHaveBeenCalledWith(subject.hex);

    expect(await middleware.evaluate()).toEqual(v.parse(BuildInfoSchema.entries.version, mocks.version));
    expect(buildInfoRepositoryGet).toBeCalledTimes(1);
    expect(cacheRepositoryget).toHaveBeenCalledWith(subject.hex);

    await CacheRepository.flush();
  });
});
