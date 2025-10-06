import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import NodeCache from "node-cache";
import { CacheHitEnum } from "../src/cache-resolver.service";
import { CacheResponse } from "../src/cache-response.middleware";

const ResponseCache = new NodeCache();
const cacheResponse = new CacheResponse(ResponseCache);

const app = new Hono();

app.get("/ping-cached", cacheResponse.handle, (c) => {
  const response = { message: "ping" };

  ResponseCache.set(c.req.url, response, tools.Duration.Seconds(10).seconds);

  return c.json(response);
});

app.post("/ping-clear", cacheResponse.clear, (c) => c.json({}));

describe("CacheResponse", () => {
  afterEach(() => ResponseCache.flushAll());

  test("responds with Cache-Hit: miss on first uncached request", async () => {
    const res = await app.request("/ping-cached");
    const json = await res.json();

    expect(res.status).toEqual(200);
    expect(res.headers.get("Cache-Hit")).toEqual(CacheHitEnum.miss);
    expect(json.message).toEqual("ping");
  });

  test("responds with Cache-Hit: hit if request is cached", async () => {
    const firstRes = await app.request("/ping-cached");
    const firstJson = await firstRes.json();

    expect(firstRes.status).toEqual(200);
    expect(firstRes.headers.get("Cache-Hit")).toEqual(CacheHitEnum.miss);
    expect(firstJson.message).toEqual("ping");

    const secondRes = await app.request("/ping-cached");
    const secondJson = await secondRes.json();

    expect(secondRes.status).toEqual(200);
    expect(secondRes.headers.get("Cache-Hit")).toEqual(CacheHitEnum.hit);
    expect(secondJson.message).toEqual("ping");
  });

  test("responds with Cache-Hit: miss after cache has expired", async () => {
    setSystemTime(0);
    const firstRes = await app.request("/ping-cached");
    const firstJson = await firstRes.json();

    expect(firstRes.status).toEqual(200);
    expect(firstRes.headers.get("Cache-Hit")).toEqual(CacheHitEnum.miss);
    expect(firstJson.message).toEqual("ping");

    const secondRes = await app.request("/ping-cached");
    const secondJson = await secondRes.json();

    expect(secondRes.status).toEqual(200);
    expect(secondRes.headers.get("Cache-Hit")).toEqual(CacheHitEnum.hit);
    expect(secondJson.message).toEqual("ping");

    setSystemTime(tools.Duration.Seconds(15).ms);

    const thirdRes = await app.request("/ping-cached");
    const thirdJson = await thirdRes.json();

    expect(thirdRes.status).toEqual(200);
    expect(thirdRes.headers.get("Cache-Hit")).toEqual(CacheHitEnum.miss);
    expect(thirdJson.message).toEqual("ping");

    setSystemTime();
  });

  test("responds with Cache-Hit: miss after clearing the cache", async () => {
    const firstRes = await app.request("/ping-cached");
    const firstJson = await firstRes.json();

    expect(firstRes.status).toEqual(200);
    expect(firstRes.headers.get("Cache-Hit")).toEqual(CacheHitEnum.miss);
    expect(firstJson.message).toEqual("ping");

    const secondRes = await app.request("/ping-cached");
    const secondJson = await secondRes.json();

    expect(secondRes.status).toEqual(200);
    expect(secondRes.headers.get("Cache-Hit")).toEqual(CacheHitEnum.hit);
    expect(secondJson.message).toEqual("ping");

    const thirdRes = await app.request("/ping-clear", { method: "POST" });
    expect(thirdRes.status).toEqual(200);

    const fourthRes = await app.request("/ping-cached");
    const fourthJson = await fourthRes.json();

    expect(fourthRes.status).toEqual(200);
    expect(fourthRes.headers.get("Cache-Hit")).toEqual(CacheHitEnum.miss);
    expect(fourthJson.message).toEqual("ping");
  });
});
