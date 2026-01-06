import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheSubjectResolver } from "../src/cache-subject-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { CacheSubjectSegmentPathStrategy } from "../src/cache-subject-segment-path.strategy";
import { CacheSubjectSegmentUserStrategy } from "../src/cache-subject-segment-user.strategy";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import { ShieldRateLimitError, ShieldRateLimitStrategy } from "../src/shield-rate-limit.strategy";
import type * as mocks from "./mocks";

const ttl = tools.Duration.Seconds(1);
const config = { type: "finite", ttl } as const;
const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const Clock = new ClockFixedAdapter(tools.Timestamp.fromNumber(1000));
const HashContent = new HashContentSha256BunStrategy();
const deps = { Clock, CacheResolver, HashContent };

const resolver = new CacheSubjectResolver(
  [
    new CacheSubjectSegmentFixedStrategy("ping"),
    new CacheSubjectSegmentPathStrategy(),
    new CacheSubjectSegmentUserStrategy(),
  ],
  deps,
);

const shieldRateLimit = new ShieldRateLimitStrategy({ enabled: true, resolver, window: ttl }, deps);

const app = new Hono()
  .get("/ping", shieldRateLimit.verify, (c) => c.text("pong"))
  // @ts-expect-error
  .onError((error, c) => {
    if (error.message === ShieldRateLimitError.message) {
      return c.json({ message: ShieldRateLimitError.message, _known: true }, ShieldRateLimitError.status);
    }
    return c.status(500);
  });

describe("ShieldRateLimitStrategy", () => {
  test("anon - happy path - within rate limit", async () => {
    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("pong");

    await CacheResolver.flush();
  });

  test("anon - failure - TooManyRequestsError", async () => {
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    const failure = await app.request("/ping", { method: "GET" });
    const json = await failure.json();

    expect(failure.status).toEqual(429);
    expect(json.message).toEqual("shield.rate.limit");

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
      new ShieldRateLimitStrategy({ enabled: true, resolver, window: ttl }, deps).verify,
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
      new ShieldRateLimitStrategy({ enabled: true, resolver, window: ttl }, deps).verify,
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
      new ShieldRateLimitStrategy({ enabled: true, resolver, window: ttl }, deps).verify,
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
      new ShieldRateLimitStrategy({ enabled: false, resolver, window: ttl }, deps).verify,
      (c) => c.text("pong"),
    );

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    await CacheResolver.flush();
  });
});
