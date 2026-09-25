import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { CacheControlNoopStrategy } from "../src/cache-control-noop.strategy";

const app = new Hono().get("/*", async (c) => {
  await CacheControlNoopStrategy(c.req.path, c);
  return c.body(null);
});

describe("CacheControlNoopStrategy", () => {
  test("happy path", async () => {
    const response = await app.request("/main.css");

    expect(response.headers.get("cache-control")).toEqual(null);
  });
});
