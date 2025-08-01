import { describe, expect, setSystemTime, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { NodeCacheRateLimitStore } from "../src/node-cache-rate-limit-store.adapter";
import { AnonSubjectResolver, RateLimitShield } from "../src/rate-limit-shield.middleware";

const store = new NodeCacheRateLimitStore(tools.Time.Minutes(1));

describe("rateLimitShield middleware", () => {
  test("allows the request when within rate limit", async () => {
    const app = new Hono();
    app.get(
      "/ping",
      RateLimitShield({ time: tools.Time.Seconds(1), enabled: true, store, subject: AnonSubjectResolver }),
      (c) => c.text("pong"),
    );

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("pong");

    store.flushAll();
  });

  test("throws TooManyRequestsError when exceeding rate limit", async () => {
    const app = new Hono();
    app.get(
      "/ping",
      RateLimitShield({ time: tools.Time.Seconds(1), enabled: true, store, subject: AnonSubjectResolver }),
      (c) => c.text("pong"),
    );

    const first = await app.request("/ping", { method: "GET" });
    expect(first.status).toEqual(200);

    const second = await app.request("/ping", { method: "GET" });
    expect(second.status).toEqual(429);

    store.flushAll();
  });

  test("allows the request after waiting for the rate limit", async () => {
    const app = new Hono();
    app.get(
      "/ping",
      RateLimitShield({ time: tools.Time.Seconds(1), enabled: true, store, subject: AnonSubjectResolver }),
      (c) => c.text("pong"),
    );

    const now = Date.now();

    const first = await app.request("/ping", { method: "GET" });
    expect(first.status).toEqual(200);

    const fiveSecondsLater = now + tools.Time.Seconds(5).ms;
    setSystemTime(fiveSecondsLater);

    const second = await app.request("/ping", { method: "GET" });
    expect(second.status).toEqual(200);

    setSystemTime();
    store.flushAll();
  });

  test("respects the enabled flag", async () => {
    const app = new Hono();
    app.get(
      "/ping",
      RateLimitShield({ time: tools.Time.Seconds(1), enabled: false, store, subject: AnonSubjectResolver }),
      (c) => c.text("pong"),
    );

    const first = await app.request("/ping", { method: "GET" });
    expect(first.status).toEqual(200);

    const second = await app.request("/ping", { method: "GET" });
    expect(second.status).toEqual(200);

    store.flushAll();
  });
});
