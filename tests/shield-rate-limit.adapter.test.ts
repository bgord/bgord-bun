import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleAdapter } from "../src/cache-resolver-simple.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import {
  AnonSubjectResolver,
  ShieldRateLimitAdapter,
  UserSubjectResolver,
} from "../src/shield-rate-limit.adapter";

const config = { ttl: tools.Duration.Seconds(1) };
const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
const Clock = new ClockFixedAdapter(tools.Timestamp.fromNumber(1000));
const deps = { Clock, CacheResolver };
const shieldRateLimit = new ShieldRateLimitAdapter({ enabled: true, subject: AnonSubjectResolver }, deps);

const app = new Hono().get("/ping", shieldRateLimit.verify, (c) => c.text("pong"));

describe("ShieldRateLimitAdapter", () => {
  test("anon - happy path - within rate limit", async () => {
    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("pong");

    await CacheResolver.flush();
  });

  test("anon - failure - TooManyRequestsError", async () => {
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(429);

    await CacheResolver.flush();
  });

  test("anon - happy path - after rate limit", async () => {
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    Clock.advanceBy(tools.Duration.Seconds(5));

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    await CacheResolver.flush();
  });

  test("user - happy path - within rate limit", async () => {
    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("pong");

    await CacheResolver.flush();
  });

  test("user - failure - TooManyRequestsError", async () => {
    const app = new Hono().get(
      "/ping",
      (c, next) => {
        c.set("user", { id: "abc" });
        return next();
      },
      new ShieldRateLimitAdapter({ enabled: true, subject: UserSubjectResolver }, deps).verify,
      (c) => c.text("pong"),
    );

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(429);

    await CacheResolver.flush();
  });

  test("user - happy path - after rate limit", async () => {
    const app = new Hono().get(
      "/ping",
      (c, next) => {
        c.set("user", { id: "abc" });
        return next();
      },
      new ShieldRateLimitAdapter({ enabled: true, subject: UserSubjectResolver }, deps).verify,
      (c) => c.text("pong"),
    );

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    Clock.advanceBy(tools.Duration.Seconds(5));

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    await CacheResolver.flush();
  });

  test("user - does not impact other users", async () => {
    const app = new Hono().get(
      "/ping",
      (c, next) => {
        c.set("user", { id: c.req.header("id") });
        return next();
      },
      new ShieldRateLimitAdapter({ enabled: true, subject: UserSubjectResolver }, deps).verify,
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

    await CacheResolver.flush();
  });

  test("disabled", async () => {
    const app = new Hono().get(
      "/ping",
      new ShieldRateLimitAdapter({ enabled: false, subject: AnonSubjectResolver }, deps).verify,
      (c) => c.text("pong"),
    );

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    await CacheResolver.flush();
  });
});
