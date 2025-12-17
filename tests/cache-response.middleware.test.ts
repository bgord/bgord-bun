import { afterEach, beforeEach, describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheSourceEnum } from "../src/cache-resolver.port";
import { CacheResolverSimpleAdapter } from "../src/cache-resolver-simple.adapter";
import { CacheResponse, CacheResponseSubjectUrl } from "../src/cache-response.middleware";

const config = { ttl: tools.Duration.Hours(1) };
const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });

const cacheResponse = new CacheResponse(
  { enabled: true, subject: CacheResponseSubjectUrl },
  { CacheResolver },
);

const app = new Hono().get("/ping-cached", cacheResponse.handle, (c) => c.json({ message: "ping" }));

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
});
