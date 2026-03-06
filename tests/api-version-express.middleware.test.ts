import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { ApiVersionMiddleware } from "../src/api-version.middleware";
import { ApiVersionExpressMiddleware } from "../src/api-version-express.middleware";
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

const middleware = new ApiVersionExpressMiddleware(deps);
const app = express()
  .use(middleware.handle())
  .get("/ping", (_request, response) => response.send("OK"));

describe("ApiVersionExpressMiddleware", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("api-version")], deps);
  const subject = await resolver.resolve();

  test("happy path", async () => {
    using buildInfoRepositoryExtract = spyOn(deps.BuildInfoRepository, "extract");
    using cacheRepositoryGet = spyOn(CacheRepository, "get");

    const first = await request(app).get("/ping");

    expect(first.status).toEqual(200);
    expect(first.headers[ApiVersionMiddleware.HEADER_NAME]).toEqual(version);
    expect(cacheRepositoryGet).toHaveBeenCalledWith(subject.hex);

    const second = await request(app).get("/ping");

    expect(second.status).toEqual(200);
    expect(second.headers[ApiVersionMiddleware.HEADER_NAME]).toEqual(version);
    expect(buildInfoRepositoryExtract).toBeCalledTimes(1);
    expect(cacheRepositoryGet).toHaveBeenCalledWith(subject.hex);

    await CacheRepository.flush();
  });
});
