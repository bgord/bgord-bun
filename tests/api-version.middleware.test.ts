import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ApiVersionMiddleware } from "../src/api-version.middleware";
import { BuildInfoRepositoryNoopStrategy } from "../src/build-info-repository-noop.strategy";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import * as mocks from "./mocks";

const version = tools.PackageVersion.fromString("1.2.3");

const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "infinite" });
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256Strategy();
const BuildInfoRepository = new BuildInfoRepositoryNoopStrategy(
  mocks.TIME_ZERO,
  version,
  mocks.SHA,
  tools.Size.fromBytes(0),
);
const deps = { CacheResolver, HashContent, BuildInfoRepository };

const middleware = new ApiVersionMiddleware(deps);

describe("ApiVersionMiddleware", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("api-version")], deps);
  const subject = await resolver.resolve();

  test("happy path", async () => {
    using buildInfoRepositoryExtract = spyOn(deps.BuildInfoRepository, "extract");
    using cacheRepositoryget = spyOn(CacheRepository, "get");

    expect(await middleware.evaluate()).toEqual(version);
    expect(cacheRepositoryget).toHaveBeenCalledWith(subject.hex);

    expect(await middleware.evaluate()).toEqual(version);
    expect(buildInfoRepositoryExtract).toBeCalledTimes(1);
    expect(cacheRepositoryget).toHaveBeenCalledWith(subject.hex);

    await CacheRepository.flush();
  });
});
