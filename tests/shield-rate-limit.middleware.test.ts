import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { RateLimitStoreNodeCacheAdapter } from "../src/rate-limit-store-node-cache.adapter";
import {
  AnonSubjectResolver,
  ShieldRateLimit,
  UserSubjectResolver,
} from "../src/shield-rate-limit.middleware";

const Clock = new ClockFixedAdapter(1000);
const deps = { Clock };

const store = new RateLimitStoreNodeCacheAdapter(tools.Duration.Seconds(1));

const app = new Hono().get(
  "/ping",
  ShieldRateLimit({ enabled: true, store, subject: AnonSubjectResolver }, deps),
  (c) => c.text("pong"),
);

describe("ShieldRateLimit middleware", () => {
  test("happy path - anon - within rate limit", async () => {
    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("pong");

    store.flushAll();
  });

  test("failure - anon - TooManyRequestsError", async () => {
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(429);

    store.flushAll();
  });

  test("happy path - anon - after rate limit", async () => {
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    Clock.advanceBy(tools.Duration.Seconds(5));

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    store.flushAll();
  });

  test("happy path - user - within rate limit", async () => {
    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("pong");

    store.flushAll();
  });

  test("failure - user - TooManyRequestsError", async () => {
    const app = new Hono().get(
      "/ping",
      (c, next) => {
        // @ts-expect-error
        c.set("user", { id: "abc" });
        return next();
      },
      ShieldRateLimit({ enabled: true, store, subject: UserSubjectResolver }, deps),
      (c) => c.text("pong"),
    );

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(429);

    store.flushAll();
  });

  test("happy path - user - after rate limit", async () => {
    const app = new Hono().get(
      "/ping",
      (c, next) => {
        // @ts-expect-error
        c.set("user", { id: "abc" });
        return next();
      },
      ShieldRateLimit({ enabled: true, store, subject: UserSubjectResolver }, deps),
      (c) => c.text("pong"),
    );

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    Clock.advanceBy(tools.Duration.Seconds(5));

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    store.flushAll();
  });

  test("user - does not impact other users", async () => {
    const app = new Hono().get(
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

    Clock.advanceBy(tools.Duration.Seconds(5));

    const firstUserSecondRequest = await app.request("/ping", { method: "GET", headers: { id: "abc" } });
    expect(firstUserSecondRequest.status).toEqual(200);

    store.flushAll();
  });

  test("disabled", async () => {
    const app = new Hono().get(
      "/ping",
      ShieldRateLimit({ enabled: false, store, subject: AnonSubjectResolver }, deps),
      (c) => c.text("pong"),
    );

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    store.flushAll();
  });
});
