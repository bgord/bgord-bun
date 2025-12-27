import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheSubjectResolver } from "../src/cache-subject-resolver.vo";
import { CacheSubjectSegmentFixed } from "../src/cache-subject-segment-fixed";
import { CacheSubjectSegmentPath } from "../src/cache-subject-segment-path";
import { CacheSubjectSegmentUser } from "../src/cache-subject-segment-user";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import { ShieldRateLimitAdapter } from "../src/shield-rate-limit.adapter";
import type * as mocks from "./mocks";

const config = { ttl: tools.Duration.Seconds(1) };
const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const Clock = new ClockFixedAdapter(tools.Timestamp.fromNumber(1000));
const HashContent = new HashContentSha256BunStrategy();
const deps = { Clock, CacheResolver, HashContent };

const resolver = new CacheSubjectResolver(
  [new CacheSubjectSegmentFixed("ping"), new CacheSubjectSegmentPath(), new CacheSubjectSegmentUser()],
  deps,
);

const shieldRateLimit = new ShieldRateLimitAdapter({ enabled: true, resolver }, deps);

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
    const app = new Hono<mocks.Config>().get(
      "/ping",
      (c, next) => {
        c.set("user", { id: "abc" });
        return next();
      },
      new ShieldRateLimitAdapter({ enabled: true, resolver }, deps).verify,
      (c) => c.text("pong"),
    );

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(429);

    await CacheResolver.flush();
  });

  test("user - happy path - after rate limit", async () => {
    const app = new Hono<mocks.Config>().get(
      "/ping",
      (c, next) => {
        c.set("user", { id: "abc" });
        return next();
      },
      new ShieldRateLimitAdapter({ enabled: true, resolver }, deps).verify,
      (c) => c.text("pong"),
    );

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    Clock.advanceBy(tools.Duration.Seconds(5));

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    await CacheResolver.flush();
  });

  test("user - does not impact other users", async () => {
    const app = new Hono<mocks.Config>().get(
      "/ping",
      (c, next) => {
        c.set("user", { id: c.req.header("id") });
        return next();
      },
      new ShieldRateLimitAdapter({ enabled: true, resolver }, deps).verify,
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
      new ShieldRateLimitAdapter({ enabled: false, resolver }, deps).verify,
      (c) => c.text("pong"),
    );

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    await CacheResolver.flush();
  });
});
