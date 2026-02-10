import { afterEach, beforeEach, describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheSourceEnum } from "../src/cache-resolver.strategy";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheResponse } from "../src/cache-response.middleware";
import { CacheSubjectRequestResolver } from "../src/cache-subject-request-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { CacheSubjectSegmentPathStrategy } from "../src/cache-subject-segment-path.strategy";
import { CacheSubjectSegmentUserStrategy } from "../src/cache-subject-segment-user.strategy";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import type * as mocks from "./mocks";

const config = { type: "finite", ttl: tools.Duration.Hours(1) } as const;
const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256Strategy();
const deps = { HashContent };

const resolver = new CacheSubjectRequestResolver(
  [
    new CacheSubjectSegmentFixedStrategy("ping"),
    new CacheSubjectSegmentPathStrategy(),
    new CacheSubjectSegmentUserStrategy(),
  ],
  deps,
);

const cacheResponse = new CacheResponse({ enabled: true, resolver }, { CacheResolver });
const cacheResponseDisabled = new CacheResponse({ enabled: false, resolver }, { CacheResolver });

const app = new Hono<mocks.Config>()
  .use((context, next) => {
    context.set("user", { id: context.req.header("id") });
    return next();
  })
  .get("/ping-cached", cacheResponse.handle, (c) => c.json({ message: "ping" }))
  .post("/clear", cacheResponse.clear, (c) => c.json({ message: "cleared" }));

describe("CacheResponse middleware", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(async () => {
    jest.useRealTimers();
    await CacheResolver.flush();
  });

  test("miss - uncached request", async () => {
    const response = await app.request("/ping-cached");
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(response.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.miss);
    expect(json.message).toEqual("ping");
  });

  test("hit - request is cached", async () => {
    const firstResponse = await app.request("/ping-cached");
    const firstJson = await firstResponse.json();

    expect(firstResponse.status).toEqual(200);
    expect(firstResponse.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.miss);
    expect(firstJson.message).toEqual("ping");

    const secondResponse = await app.request("/ping-cached");
    const secondJson = await secondResponse.json();

    expect(secondResponse.status).toEqual(200);
    expect(secondResponse.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.hit);
    expect(secondJson.message).toEqual("ping");
  });

  test("miss - cache has expired", async () => {
    const firstResponse = await app.request("/ping-cached");
    const firstJson = await firstResponse.json();

    expect(firstResponse.status).toEqual(200);
    expect(firstResponse.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.miss);
    expect(firstJson.message).toEqual("ping");

    const secondResponse = await app.request("/ping-cached");
    const secondJson = await secondResponse.json();

    expect(secondResponse.status).toEqual(200);
    expect(secondResponse.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.hit);
    expect(secondJson.message).toEqual("ping");

    jest.advanceTimersByTime(tools.Duration.Hours(2).ms);
    const thirdResponse = await app.request("/ping-cached");
    const thirdJson = await thirdResponse.json();

    expect(thirdResponse.status).toEqual(200);
    expect(thirdResponse.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.miss);
    expect(thirdJson.message).toEqual("ping");
  });

  test("miss - clearing the cache", async () => {
    const firstResponse = await app.request("/ping-cached");
    const firstJson = await firstResponse.json();

    expect(firstResponse.status).toEqual(200);
    expect(firstResponse.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.miss);
    expect(firstJson.message).toEqual("ping");

    const secondResponse = await app.request("/ping-cached");
    const secondJson = await secondResponse.json();

    expect(secondResponse.status).toEqual(200);
    expect(secondResponse.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.hit);
    expect(secondJson.message).toEqual("ping");

    await CacheResolver.flush();
    const fourthResponse = await app.request("/ping-cached");
    const fourthJson = await fourthResponse.json();

    expect(fourthResponse.status).toEqual(200);
    expect(fourthResponse.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.miss);
    expect(fourthJson.message).toEqual("ping");
  });

  test("hit for one user, miss for another", async () => {
    const firstResponseAdam = await app.request("/ping-cached", { headers: { id: "Adam" } });
    const firstJsonAdam = await firstResponseAdam.json();

    expect(firstResponseAdam.status).toEqual(200);
    expect(firstResponseAdam.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.miss);
    expect(firstJsonAdam.message).toEqual("ping");

    const secondResponseAdam = await app.request("/ping-cached", { headers: { id: "Adam" } });
    const secondJsonAdam = await secondResponseAdam.json();

    expect(secondResponseAdam.status).toEqual(200);
    expect(secondResponseAdam.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.hit);
    expect(secondJsonAdam.message).toEqual("ping");

    const responseEve = await app.request("/ping-cached", { headers: { id: "Eve" } });
    const jsonEve = await responseEve.json();

    expect(responseEve.status).toEqual(200);
    expect(responseEve.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.miss);
    expect(jsonEve.message).toEqual("ping");
  });

  test("disabled", async () => {
    const app = new Hono<mocks.Config>()
      .use((context, next) => {
        context.set("user", { id: context.req.header("id") });
        return next();
      })
      .get("/ping", cacheResponseDisabled.handle, (c) => c.json({ message: "ping" }));
    using cacheResolverResolve = spyOn(CacheResolver, "resolve");

    const response = await app.request("/ping");
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(response.headers.get("Cache-Hit")).toEqual(null);
    expect(json.message).toEqual("ping");
    expect(cacheResolverResolve).not.toHaveBeenCalled();
  });

  test("clear", async () => {
    const firstResponse = await app.request("/ping-cached");
    const firstJson = await firstResponse.json();

    expect(firstResponse.status).toEqual(200);
    expect(firstResponse.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.miss);
    expect(firstJson.message).toEqual("ping");

    await app.request("/clear", { method: "POST" });
    const secondResponse = await app.request("/ping-cached");
    const secondJson = await secondResponse.json();

    expect(secondResponse.status).toEqual(200);
    expect(secondResponse.headers.get("Cache-Hit")).toEqual(CacheSourceEnum.miss);
    expect(secondJson.message).toEqual("ping");
  });
});
