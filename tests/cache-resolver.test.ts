import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import NodeCache from "node-cache";
import { CacheHitEnum, CacheResolver, CacheResolverStrategy } from "../src/cache-resolver.service";

describe("cache-resolver", () => {
  test("simple - miss", async () => {
    const cache = new NodeCache();

    const resolver = async () => Promise.resolve(123);

    const result = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
    });

    expect(result).toEqual({ data: 123 });
  });

  test("simple - hit", async () => {
    const cache = new NodeCache();

    const resolver = () => Promise.resolve(123);

    const first = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
    });

    expect(first).toEqual({ data: 123 });

    const second = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
    });

    expect(second).toEqual({ data: 123 });
  });

  test("simple - miss hit miss", async () => {
    const cache = new NodeCache({ stdTTL: tools.Time.Minutes(1).seconds });

    const resolver = () => Promise.resolve(123);

    const first = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
    });

    expect(first).toEqual({ data: 123 });

    const second = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
    });

    expect(second).toEqual({ data: 123 });

    jest.setSystemTime(Date.now() + tools.Time.Minutes(11).ms);

    const third = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
    });

    expect(third).toEqual({ data: 123 });

    jest.setSystemTime();
  });

  test("with_metadata - miss", async () => {
    const cache = new NodeCache();

    const resolver = async () => Promise.resolve(123);

    const result = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
      strategy: CacheResolverStrategy.with_metadata,
    });

    expect(result).toEqual({ data: 123, meta: { hit: CacheHitEnum.miss } });
  });

  test("with_metadata - hit", async () => {
    const cache = new NodeCache();

    const resolver = () => Promise.resolve(123);

    const first = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
      strategy: CacheResolverStrategy.with_metadata,
    });

    expect(first).toEqual({ data: 123, meta: { hit: CacheHitEnum.miss } });

    const second = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
      strategy: CacheResolverStrategy.with_metadata,
    });

    expect(second).toEqual({ data: 123, meta: { hit: CacheHitEnum.hit } });
  });

  test("with_metadata - miss hit miss", async () => {
    const cache = new NodeCache({ stdTTL: tools.Time.Minutes(1).seconds });

    const resolver = () => Promise.resolve(123);

    const first = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
      strategy: CacheResolverStrategy.with_metadata,
    });

    expect(first).toEqual({ data: 123, meta: { hit: CacheHitEnum.miss } });

    const second = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
      strategy: CacheResolverStrategy.with_metadata,
    });

    expect(second).toEqual({ data: 123, meta: { hit: CacheHitEnum.hit } });

    jest.setSystemTime(Date.now() + tools.Time.Minutes(11).ms);

    const third = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
      strategy: CacheResolverStrategy.with_metadata,
    });

    expect(third).toEqual({ data: 123, meta: { hit: CacheHitEnum.miss } });

    jest.setSystemTime();
  });

  test("request_headers - miss", async () => {
    const cache = new NodeCache();

    const resolver = async () => Promise.resolve(123);

    const result = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
      strategy: CacheResolverStrategy.request_headers,
    });

    expect(result.data).toEqual(123);
    expect(result.header).toEqual({
      name: "cache-hit",
      value: CacheHitEnum.miss,
    });
  });

  test("request_headers - hit", async () => {
    const cache = new NodeCache();

    const resolver = () => Promise.resolve(123);

    const first = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
      strategy: CacheResolverStrategy.request_headers,
    });

    expect(first.data).toEqual(123);
    expect(first.header).toEqual({
      name: "cache-hit",
      value: CacheHitEnum.miss,
    });

    const second = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
      strategy: CacheResolverStrategy.request_headers,
    });

    expect(second.data).toEqual(123);
    expect(second.header).toEqual({
      name: "cache-hit",
      value: CacheHitEnum.hit,
    });
  });

  test("request_headers - miss hit miss", async () => {
    const cache = new NodeCache({ stdTTL: tools.Time.Minutes(1).seconds });

    const resolver = () => Promise.resolve(123);

    const first = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
      strategy: CacheResolverStrategy.request_headers,
    });

    expect(first.data).toEqual(123);
    expect(first.header).toEqual({
      name: "cache-hit",
      value: CacheHitEnum.miss,
    });

    const second = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
      strategy: CacheResolverStrategy.request_headers,
    });

    expect(second.data).toEqual(123);
    expect(second.header).toEqual({
      name: "cache-hit",
      value: CacheHitEnum.hit,
    });

    jest.setSystemTime(Date.now() + tools.Time.Minutes(11).ms);

    const third = await CacheResolver.resolve<number>(cache, {
      key: "ID_1",
      resolver,
      strategy: CacheResolverStrategy.request_headers,
    });

    expect(third.data).toEqual(123);
    expect(third.header).toEqual({
      name: "cache-hit",
      value: CacheHitEnum.miss,
    });

    jest.setSystemTime();
  });

  test("request_headers - miss - controller", async () => {
    const cache = new NodeCache();

    const resolver = async () => Promise.resolve(123);

    const app = new Hono();

    app.get("/data", async (c) => {
      const result = await CacheResolver.resolve<number>(cache, {
        key: "ID_1",
        resolver,
        strategy: CacheResolverStrategy.request_headers,
      });

      return result.respond(c);
    });

    const result = await app.request("/data", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(result.headers.get("cache-hit")).toEqual("miss");
    expect(await result.json()).toEqual(123);
  });

  test("request_headers - hit", async () => {
    const cache = new NodeCache();

    const resolver = () => Promise.resolve(123);

    const app = new Hono();

    app.get("/data", async (c) => {
      const result = await CacheResolver.resolve<number>(cache, {
        key: "ID_1",
        resolver,
        strategy: CacheResolverStrategy.request_headers,
      });

      return result.respond(c);
    });

    const first = await app.request("/data", { method: "GET" });

    expect(first.status).toEqual(200);
    expect(first.headers.get("cache-hit")).toEqual("miss");
    expect(await first.json()).toEqual(123);

    const second = await app.request("/data", { method: "GET" });

    expect(second.status).toEqual(200);
    expect(second.headers.get("cache-hit")).toEqual("hit");
    expect(await second.json()).toEqual(123);
  });

  test("request_headers - miss hit miss", async () => {
    const cache = new NodeCache({ stdTTL: tools.Time.Minutes(1).seconds });

    const resolver = () => Promise.resolve(123);

    const app = new Hono();

    app.get("/data", async (c) => {
      const result = await CacheResolver.resolve<number>(cache, {
        key: "ID_1",
        resolver,
        strategy: CacheResolverStrategy.request_headers,
      });

      return result.respond(c);
    });

    const first = await app.request("/data", { method: "GET" });

    expect(first.status).toEqual(200);
    expect(first.headers.get("cache-hit")).toEqual("miss");
    expect(await first.json()).toEqual(123);

    const second = await app.request("/data", { method: "GET" });

    expect(second.status).toEqual(200);
    expect(second.headers.get("cache-hit")).toEqual("hit");
    expect(await second.json()).toEqual(123);

    jest.setSystemTime(Date.now() + tools.Time.Minutes(11).ms);

    const third = await app.request("/data", { method: "GET" });

    expect(third.status).toEqual(200);
    expect(third.headers.get("cache-hit")).toEqual("miss");
    expect(await third.json()).toEqual(123);

    jest.setSystemTime();
  });
});
