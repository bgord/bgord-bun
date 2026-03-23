import { describe, expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { ApiVersionMiddleware } from "../src/api-version.middleware";
import { ApiVersionHonoMiddleware } from "../src/api-version-hono.middleware";
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
const BuildInfoRepository = new ReactiveConfigFileJsonAdapter(BUILD_INFO_FILE_PATH, BuildInfoSchema, {
  FileReaderJson: new FileReaderJsonNoopAdapter({
    version,
    timestamp: mocks.TIME_ZERO.ms,
    sha: mocks.SHA.toString(),
    size: 0,
  }),
});
const deps = { CacheResolver, HashContent, BuildInfoRepository };

const middleware = new ApiVersionHonoMiddleware(deps);
const app = new Hono().use(middleware.handle()).get("/ping", (c) => c.text("OK"));

describe("ApiVersionHonoMiddleware", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("api-version")], deps);
  const subject = await resolver.resolve();

  test("happy path", async () => {
    using buildInfoRepositoryGet = spyOn(deps.BuildInfoRepository, "get");
    using cacheRepositoryGet = spyOn(CacheRepository, "get");

    const first = await app.request("/ping", { method: "GET" });

    expect(first.status).toEqual(200);
    expect(first.headers.get(ApiVersionMiddleware.HEADER_NAME)).toEqual(version);
    expect(cacheRepositoryGet).toHaveBeenCalledWith(subject.hex);

    const second = await app.request("/ping", { method: "GET" });

    expect(second.status).toEqual(200);
    expect(second.headers.get(ApiVersionMiddleware.HEADER_NAME)).toEqual(version);
    expect(buildInfoRepositoryGet).toBeCalledTimes(1);
    expect(cacheRepositoryGet).toHaveBeenCalledWith(subject.hex);

    await CacheRepository.flush();
  });
});
