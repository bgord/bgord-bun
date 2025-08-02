import { describe, expect, setSystemTime, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { NodeCacheRateLimitStore } from "../src/node-cache-rate-limit-store.adapter";
import {
  AnonSubjectResolver,
  RateLimitShield,
  UserSubjectResolver,
} from "../src/rate-limit-shield.middleware";

const store = new NodeCacheRateLimitStore(tools.Time.Seconds(1));

describe("rateLimitShield middleware", () => {
  test("respects the enabled flag", async () => {
    const app = new Hono();
    app.get("/ping", RateLimitShield({ enabled: false, store, subject: AnonSubjectResolver }), (c) =>
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
    app.get("/ping", RateLimitShield({ enabled: true, store, subject: AnonSubjectResolver }), (c) =>
      c.text("pong"),
    );

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("pong");

    store.flushAll();
  });

  test("anon - throws TooManyRequestsError when exceeding rate limit", async () => {
    const app = new Hono();
    app.get("/ping", RateLimitShield({ enabled: true, store, subject: AnonSubjectResolver }), (c) =>
      c.text("pong"),
    );

    const first = await app.request("/ping", { method: "GET" });
    expect(first.status).toEqual(200);

    const second = await app.request("/ping", { method: "GET" });
    expect(second.status).toEqual(429);

    store.flushAll();
  });

  test("anon - allows the request after waiting for the rate limit", async () => {
    const app = new Hono();
    app.get("/ping", RateLimitShield({ enabled: true, store, subject: AnonSubjectResolver }), (c) =>
      c.text("pong"),
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

  test("user - allows the request when within rate limit", async () => {
    const app = new Hono();
    app.get("/ping", RateLimitShield({ enabled: true, store, subject: UserSubjectResolver }), (c) =>
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
      RateLimitShield({ enabled: true, store, subject: UserSubjectResolver }),
      (c) => c.text("pong"),
    );

    const first = await app.request("/ping", { method: "GET" });
    expect(first.status).toEqual(200);

    const second = await app.request("/ping", { method: "GET" });
    expect(second.status).toEqual(429);

    store.flushAll();
  });

  test("user - allows the request after waiting for the rate limit", async () => {
    const app = new Hono();
    app.get(
      "/ping",
      (c, next) => {
        // @ts-expect-error
        c.set("user", { id: "abc" });
        return next();
      },
      RateLimitShield({ enabled: true, store, subject: UserSubjectResolver }),
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

  test("user - does not impact other users", async () => {
    const app = new Hono();
    app.get(
      "/ping",
      (c, next) => {
        // @ts-expect-error
        c.set("user", { id: c.req.header("id") });
        return next();
      },
      RateLimitShield({ enabled: true, store, subject: UserSubjectResolver }),
      (c) => c.text("pong"),
    );

    const now = Date.now();

    const firstUserFirstRequest = await app.request("/ping", { method: "GET", headers: { id: "abc" } });
    expect(firstUserFirstRequest.status).toEqual(200);

    const secondUserFirstRequest = await app.request("/ping", { method: "GET", headers: { id: "def" } });
    expect(secondUserFirstRequest.status).toEqual(200);

    const secondUserSecondRequest = await app.request("/ping", { method: "GET", headers: { id: "def" } });
    expect(secondUserSecondRequest.status).toEqual(429);

    const fiveSecondsLater = now + tools.Time.Seconds(5).ms;
    setSystemTime(fiveSecondsLater);

    const firstUserSecondRequest = await app.request("/ping", { method: "GET", headers: { id: "abc" } });
    expect(firstUserSecondRequest.status).toEqual(200);

    setSystemTime();
    store.flushAll();
  });
});
