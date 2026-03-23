import { describe, expect, spyOn, test } from "bun:test";
import * as v from "valibot";
import { ApiVersionMiddleware } from "../src/api-version.middleware";
import { BUILD_INFO_FILE_PATH, BuildInfoSchema } from "../src/build-info-repository.strategy";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { ReactiveConfigFileJsonAdapter } from "../src/reactive-config-file-json.adapter";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import * as mocks from "./mocks";

const version = "v1.2.3";

const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "infinite" });
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256Strategy();
const BuildInfoConfig = new ReactiveConfigFileJsonAdapter(BUILD_INFO_FILE_PATH, BuildInfoSchema, {
  FileReaderJson: new FileReaderJsonNoopAdapter({
    version,
    timestamp: mocks.TIME_ZERO.ms,
    sha: mocks.SHA.toString(),
    size: 0,
  }),
});
const deps = { CacheResolver, HashContent, BuildInfoConfig };

const middleware = new ApiVersionMiddleware(deps);

describe("ApiVersionMiddleware", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("api-version")], deps);
  const subject = await resolver.resolve();

  test("happy path", async () => {
    using buildInfoRepositoryGet = spyOn(deps.BuildInfoConfig, "get");
    using cacheRepositoryget = spyOn(CacheRepository, "get");

    expect(await middleware.evaluate()).toEqual(v.parse(BuildInfoSchema.entries.version, version));
    expect(cacheRepositoryget).toHaveBeenCalledWith(subject.hex);

    expect(await middleware.evaluate()).toEqual(v.parse(BuildInfoSchema.entries.version, version));
    expect(buildInfoRepositoryGet).toBeCalledTimes(1);
    expect(cacheRepositoryget).toHaveBeenCalledWith(subject.hex);

    await CacheRepository.flush();
  });
});
