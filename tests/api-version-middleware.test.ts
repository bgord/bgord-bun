import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ApiVersion } from "../src/api-version.middleware";
import { BuildInfoRepositoryNoopStrategy } from "../src/build-info-repository-noop.strategy";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheSubjectApplicationResolver } from "../src/cache-subject-application-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import * as mocks from "./mocks";

const version = "1.2.3";

const Clock = new ClockSystemAdapter();
const config = { type: "infinite" } as const;
const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256BunStrategy();
const BuildInfoRepository = new BuildInfoRepositoryNoopStrategy(
  mocks.TIME_ZERO,
  tools.PackageVersion.fromString(version),
);
const deps = { Clock, CacheResolver, HashContent, BuildInfoRepository };
const app = new Hono().use(ApiVersion.build(deps)).get("/ping", (c) => c.text("OK"));

describe("ApiVersion middleware", async () => {
  const resolver = new CacheSubjectApplicationResolver(
    [new CacheSubjectSegmentFixedStrategy("api-version")],
    deps,
  );
  const subject = await resolver.resolve();

  test("happy path", async () => {
    const buildInfoRepositoryExtract = spyOn(deps.BuildInfoRepository, "extract");
    const getSpy = spyOn(CacheRepository, "get");

    const first = await app.request("/ping", { method: "GET" });

    expect(first.status).toEqual(200);
    expect(first.headers.get(ApiVersion.HEADER_NAME)).toEqual(version);
    expect(getSpy).toHaveBeenCalledWith(subject.hex);

    const second = await app.request("/ping", { method: "GET" });

    expect(second.status).toEqual(200);
    expect(second.headers.get(ApiVersion.HEADER_NAME)).toEqual(version);
    expect(buildInfoRepositoryExtract).toBeCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(subject.hex);

    await CacheRepository.flush();
  });
});
