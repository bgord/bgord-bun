import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ApiVersionMiddleware } from "../src/api-version.middleware";
import { ApiVersionHonoMiddleware } from "../src/api-version-hono.middleware";
import { BuildInfoRepositoryNoopStrategy } from "../src/build-info-repository-noop.strategy";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import * as mocks from "./mocks";

const version = "1.2.3";

const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "infinite" });
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256Strategy();
const BuildInfoRepository = new BuildInfoRepositoryNoopStrategy(
  mocks.TIME_ZERO,
  tools.PackageVersion.fromString(version),
  mocks.SHA,
  tools.Size.fromBytes(0),
);
const deps = { CacheResolver, HashContent, BuildInfoRepository };

const middleware = new ApiVersionHonoMiddleware(deps);
const app = new Hono().use(middleware.handle()).get("/ping", (c) => c.text("OK"));

describe("ApiVersionHonoMiddleware", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("api-version")], deps);
  const subject = await resolver.resolve();

  test("happy path", async () => {
    using buildInfoRepositoryExtract = spyOn(deps.BuildInfoRepository, "extract");
    using cacheRepositoryGet = spyOn(CacheRepository, "get");

    const first = await app.request("/ping", { method: "GET" });

    expect(first.status).toEqual(200);
    expect(first.headers.get(ApiVersionMiddleware.HEADER_NAME)).toEqual(version);
    expect(cacheRepositoryGet).toHaveBeenCalledWith(subject.hex);

    const second = await app.request("/ping", { method: "GET" });

    expect(second.status).toEqual(200);
    expect(second.headers.get(ApiVersionMiddleware.HEADER_NAME)).toEqual(version);
    expect(buildInfoRepositoryExtract).toBeCalledTimes(1);
    expect(cacheRepositoryGet).toHaveBeenCalledWith(subject.hex);

    await CacheRepository.flush();
  });
});
