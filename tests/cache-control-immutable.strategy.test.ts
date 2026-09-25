import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { CacheControlImmutableStrategy } from "../src/cache-control-immutable.strategy";
import { CacheControlMustRevalidateStrategy } from "../src/cache-control-must-revalidate.strategy";

const strategy = CacheControlImmutableStrategy(CacheControlMustRevalidateStrategy(tools.Duration.Minutes(5)));

const app = new Hono().get("/*", async (c) => {
  await strategy(c.req.path, c);
  return c.body(null);
});

describe("CacheControlImmutableStrategy", () => {
  test("hashed", async () => {
    const response = await app.request("/main-a1b2c3d4.js");

    expect(response.headers.get("cache-control")).toEqual("public, max-age=31536000, immutable");
  });

  test("hashed - nested", async () => {
    const response = await app.request("/assets/main-a1b2c3d4.js");

    expect(response.headers.get("cache-control")).toEqual("public, max-age=31536000, immutable");
  });

  test("versioned", async () => {
    const response = await app.request("/main.css?v=123");

    expect(response.headers.get("cache-control")).toEqual("public, max-age=31536000, immutable");
  });

  test("fallback", async () => {
    const response = await app.request("/main.css");

    expect(response.headers.get("cache-control")).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - empty version", async () => {
    const response = await app.request("/main.css?v=");

    expect(response.headers.get("cache-control")).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - hash too short", async () => {
    const response = await app.request("/main-a1b2c3d.js");

    expect(response.headers.get("cache-control")).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - hash too long", async () => {
    const response = await app.request("/main-a1b2c3d4e.js");

    expect(response.headers.get("cache-control")).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - hash uppercase", async () => {
    const response = await app.request("/main-A1B2C3D4.js");

    expect(response.headers.get("cache-control")).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - hash without dash", async () => {
    const response = await app.request("/main.a1b2c3d4.js");

    expect(response.headers.get("cache-control")).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - hashed not js", async () => {
    const response = await app.request("/main-a1b2c3d4.css");

    expect(response.headers.get("cache-control")).toEqual("public, max-age=300, must-revalidate");
  });

  test("fallback - hashed js not at end", async () => {
    const response = await app.request("/main-a1b2c3d4.js.map");

    expect(response.headers.get("cache-control")).toEqual("public, max-age=300, must-revalidate");
  });
});
