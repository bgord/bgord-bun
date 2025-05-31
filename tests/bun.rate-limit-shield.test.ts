import { describe, expect, setSystemTime, test } from "bun:test";
import { Hono } from "hono";

import { rateLimitShield } from "../src/rate-limit-shield";

describe("rateLimitShield middleware", () => {
  test("allows the request when within rate limit", async () => {
    const app = new Hono();
    app.get("/ping", rateLimitShield(bg.Time.Seconds(1)), (c) => c.text("pong"));

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("pong");
  });

  test("throws TooManyRequestsError when exceeding rate limit", async () => {
    const app = new Hono();
    app.get("/ping", rateLimitShield(bg.Time.Seconds(1)), (c) => c.text("pong"));

    // Send two requests immediately 1000 milliseconds
    const first = await app.request("/ping", { method: "GET" });
    expect(first.status).toEqual(200);

    const second = await app.request("/ping", { method: "GET" });
    expect(second.status).toEqual(429);
  });

  test("allows the request after waiting for the rate limit", async () => {
    const app = new Hono();
    app.get("/ping", rateLimitShield(bg.Time.Seconds(1)), (c) => c.text("pong"));

    const now = Date.now();

    // Send two requests immediately 1000 milliseconds
    const first = await app.request("/ping", { method: "GET" });
    expect(first.status).toEqual(200);

    const fiveSecondsLater = now + bg.Time.Seconds(5).ms;
    setSystemTime(fiveSecondsLater);

    const second = await app.request("/ping", { method: "GET" });
    expect(second.status).toEqual(200);

    setSystemTime();
  });
});
