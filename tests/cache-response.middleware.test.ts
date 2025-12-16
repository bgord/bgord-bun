import { afterEach, beforeEach, describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import NodeCache from "node-cache";
import { CacheHitEnum } from "../src/cache-resolver.service";
import { CacheResponse } from "../src/cache-response.middleware";

const ResponseCache = new NodeCache();
const cacheResponse = new CacheResponse(ResponseCache);

const app = new Hono()
  .get("/ping-cached", cacheResponse.handle, (c) => {
    const response = { message: "ping" };
    ResponseCache.set(c.req.url, response, tools.Duration.Seconds(10).seconds);
    return c.json(response);
  })
  .post("/ping-clear", cacheResponse.clear, (c) => c.json({}));

describe("CacheResponse middleware", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    ResponseCache.flushAll();
  });

  test("miss - uncached request", async () => {
    const response = await app.request("/ping-cached");
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(response.headers.get("Cache-Hit")).toEqual(CacheHitEnum.miss);
    expect(json.message).toEqual("ping");
  });

  test("hit - request is cached", async () => {
    const firstResponse = await app.request("/ping-cached");
    const firstJson = await firstResponse.json();

    expect(firstResponse.status).toEqual(200);
    expect(firstResponse.headers.get("Cache-Hit")).toEqual(CacheHitEnum.miss);
    expect(firstJson.message).toEqual("ping");

    const secondResponse = await app.request("/ping-cached");
    const secondJson = await secondResponse.json();

    expect(secondResponse.status).toEqual(200);
    expect(secondResponse.headers.get("Cache-Hit")).toEqual(CacheHitEnum.hit);
    expect(secondJson.message).toEqual("ping");
  });

  test("miss - cache has expired", async () => {
    const firstResponse = await app.request("/ping-cached");
    const firstJson = await firstResponse.json();

    expect(firstResponse.status).toEqual(200);
    expect(firstResponse.headers.get("Cache-Hit")).toEqual(CacheHitEnum.miss);
    expect(firstJson.message).toEqual("ping");

    const secondResponse = await app.request("/ping-cached");
    const secondJson = await secondResponse.json();

    expect(secondResponse.status).toEqual(200);
    expect(secondResponse.headers.get("Cache-Hit")).toEqual(CacheHitEnum.hit);
    expect(secondJson.message).toEqual("ping");

    jest.advanceTimersByTime(tools.Duration.Seconds(15).ms);
    const thirdResponse = await app.request("/ping-cached");
    const thirdJson = await thirdResponse.json();

    expect(thirdResponse.status).toEqual(200);
    expect(thirdResponse.headers.get("Cache-Hit")).toEqual(CacheHitEnum.miss);
    expect(thirdJson.message).toEqual("ping");
  });

  test("miss - clearing the cache", async () => {
    const firstResponse = await app.request("/ping-cached");
    const firstJson = await firstResponse.json();

    expect(firstResponse.status).toEqual(200);
    expect(firstResponse.headers.get("Cache-Hit")).toEqual(CacheHitEnum.miss);
    expect(firstJson.message).toEqual("ping");

    const secondResponse = await app.request("/ping-cached");
    const secondJson = await secondResponse.json();

    expect(secondResponse.status).toEqual(200);
    expect(secondResponse.headers.get("Cache-Hit")).toEqual(CacheHitEnum.hit);
    expect(secondJson.message).toEqual("ping");

    const thirdResponse = await app.request("/ping-clear", { method: "POST" });

    expect(thirdResponse.status).toEqual(200);

    const fourthResponse = await app.request("/ping-cached");
    const fourthJson = await fourthResponse.json();

    expect(fourthResponse.status).toEqual(200);
    expect(fourthResponse.headers.get("Cache-Hit")).toEqual(CacheHitEnum.miss);
    expect(fourthJson.message).toEqual("ping");
  });
});
