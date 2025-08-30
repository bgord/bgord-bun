import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { RateLimitStoreNodeCache } from "../src/rate-limit-store-node-cache.adapter";
import {
  AnonSubjectResolver,
  ShieldRateLimit,
  UserSubjectResolver,
} from "../src/shield-rate-limit.middleware";

const Clock = new ClockFixedAdapter(1000);
const deps = { Clock };

const store = new RateLimitStoreNodeCache(tools.Time.Seconds(1));

describe("rateLimitShield middleware", () => {
  test("respects the enabled flag", async () => {
    const app = new Hono();
    app.get("/ping", ShieldRateLimit({ enabled: false, store, subject: AnonSubjectResolver }, deps), (c) =>
      c.text("pong"),
    );

    const first = await app.request("/ping", { method: "GET" });
    expect(first.status).toEqual(200);

    const second = await app.request("/ping", { method: "GET" });
    expect(second.status).toEqual(200);

    store.flushAll();
  });

  test("anon - allows the request when within rate limit", async () => {
    const app = new Hono();
    app.get("/ping", ShieldRateLimit({ enabled: true, store, subject: AnonSubjectResolver }, deps), (c) =>
      c.text("pong"),
    );

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("pong");

    store.flushAll();
  });

  test("anon - throws TooManyRequestsError when exceeding rate limit", async () => {
    const app = new Hono();
    app.get("/ping", ShieldRateLimit({ enabled: true, store, subject: AnonSubjectResolver }, deps), (c) =>
      c.text("pong"),
    );

    const first = await app.request("/ping", { method: "GET" });
    expect(first.status).toEqual(200);

    const second = await app.request("/ping", { method: "GET" });
    expect(second.status).toEqual(429);

    store.flushAll();
  });

  test("anon - allows the request after waiting for the rate limit", async () => {
    const Clock = new ClockFixedAdapter(1000);
    const deps = { Clock };

    const app = new Hono();
    app.get("/ping", ShieldRateLimit({ enabled: true, store, subject: AnonSubjectResolver }, deps), (c) =>
      c.text("pong"),
    );

    const first = await app.request("/ping", { method: "GET" });
    expect(first.status).toEqual(200);

    Clock.advanceBy(tools.Time.Seconds(5));

    const second = await app.request("/ping", { method: "GET" });
    expect(second.status).toEqual(200);

    store.flushAll();
  });

  test("user - allows the request when within rate limit", async () => {
    const app = new Hono();
    app.get("/ping", ShieldRateLimit({ enabled: true, store, subject: UserSubjectResolver }, deps), (c) =>
      c.text("pong"),
    );

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("pong");

    store.flushAll();
  });

  test("user - throws TooManyRequestsError when exceeding rate limit", async () => {
    const app = new Hono();
    app.get(
      "/ping",
      (c, next) => {
        // @ts-expect-error
        c.set("user", { id: "abc" });
        return next();
      },
      ShieldRateLimit({ enabled: true, store, subject: UserSubjectResolver }, deps),
      (c) => c.text("pong"),
    );

    const first = await app.request("/ping", { method: "GET" });
    expect(first.status).toEqual(200);

    const second = await app.request("/ping", { method: "GET" });
    expect(second.status).toEqual(429);

    store.flushAll();
  });

  test("user - allows the request after waiting for the rate limit", async () => {
    const Clock = new ClockFixedAdapter(1000);
    const deps = { Clock };

    const app = new Hono();
    app.get(
      "/ping",
      (c, next) => {
        // @ts-expect-error
        c.set("user", { id: "abc" });
        return next();
      },
      ShieldRateLimit({ enabled: true, store, subject: UserSubjectResolver }, deps),
      (c) => c.text("pong"),
    );

    const first = await app.request("/ping", { method: "GET" });
    expect(first.status).toEqual(200);

    Clock.advanceBy(tools.Time.Seconds(5));

    const second = await app.request("/ping", { method: "GET" });
    expect(second.status).toEqual(200);

    store.flushAll();
  });

  test("user - does not impact other users", async () => {
    const Clock = new ClockFixedAdapter(1000);
    const deps = { Clock };

    const app = new Hono();
    app.get(
      "/ping",
      (c, next) => {
        // @ts-expect-error
        c.set("user", { id: c.req.header("id") });
        return next();
      },
      ShieldRateLimit({ enabled: true, store, subject: UserSubjectResolver }, deps),
      (c) => c.text("pong"),
    );

    const firstUserFirstRequest = await app.request("/ping", { method: "GET", headers: { id: "abc" } });
    expect(firstUserFirstRequest.status).toEqual(200);

    const secondUserFirstRequest = await app.request("/ping", { method: "GET", headers: { id: "def" } });
    expect(secondUserFirstRequest.status).toEqual(200);

    const secondUserSecondRequest = await app.request("/ping", { method: "GET", headers: { id: "def" } });
    expect(secondUserSecondRequest.status).toEqual(429);

    Clock.advanceBy(tools.Time.Seconds(5));

    const firstUserSecondRequest = await app.request("/ping", { method: "GET", headers: { id: "abc" } });
    expect(firstUserSecondRequest.status).toEqual(200);

    store.flushAll();
  });
});
