import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { CacheControlMustRevalidateStrategy } from "../src/cache-control-must-revalidate.strategy";

const strategy = CacheControlMustRevalidateStrategy(tools.Duration.Minutes(5));

const app = new Hono().get("/*", async (c) => {
  await strategy(c.req.path, c);
  return c.body(null);
});

describe("CacheControlMustRevalidateStrategy", () => {
  test("happy path", async () => {
    const response = await app.request("/main.css");

    expect(response.headers.get("cache-control")).toEqual("public, max-age=300, must-revalidate");
  });
});
