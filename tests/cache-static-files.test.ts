import { describe, expect, test } from "bun:test";
import { Hono } from "hono";

import {
  CacheStaticFiles,
  CacheStaticFilesStrategy,
} from "../src/cache-static-files.middleware";

describe("Cache static files", () => {
  test("sets cache-control header for strategy 'never'", async () => {
    const app = new Hono();
    app.use(CacheStaticFiles.handle(CacheStaticFilesStrategy.never));
    app.get("/", (c) => c.text("Never"));

    const res = await app.request("/");
    expect(res.headers.get("cache-control")).toBe(
      "private, no-cache, no-store, must-revalidate",
    );
  });

  test("sets cache-control header for strategy 'always'", async () => {
    const app = new Hono();
    app.use(CacheStaticFiles.handle(CacheStaticFilesStrategy.always));
    app.get("/", (c) => c.text("Always"));

    const res = await app.request("/");
    expect(res.headers.get("cache-control")).toMatch(
      /^public, max-age=\d+, immutable$/,
    );
  });

  test("sets cache-control header for strategy 'five_minutes'", async () => {
    const app = new Hono();
    app.use(CacheStaticFiles.handle(CacheStaticFilesStrategy.five_minutes));
    app.get("/", (c) => c.text("Five minutes"));

    const res = await app.request("/");
    expect(res.headers.get("cache-control")).toMatch(/^public, max-age=\d+$/);

    const maxAge = Number(
      res.headers.get("cache-control")?.match(/max-age=(\d+)/)?.[1],
    );
    expect(maxAge).toBeGreaterThanOrEqual(299); // account for rounding
    expect(maxAge).toBeLessThanOrEqual(301);
  });
});
