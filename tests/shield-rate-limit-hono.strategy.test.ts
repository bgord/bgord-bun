import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { type Context, Hono } from "hono";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { ShieldRateLimitStrategyError } from "../src/shield-rate-limit.strategy";
import { ShieldRateLimitHonoStrategy } from "../src/shield-rate-limit-hono.strategy";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { SubjectSegmentPathStrategy } from "../src/subject-segment-path.strategy";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import type * as mocks from "./mocks";

const ttl = tools.Duration.Seconds(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const Clock = new ClockFixedAdapter(tools.Timestamp.fromNumber(1000));
const HashContent = new HashContentSha256Strategy();
const deps = { Clock, CacheResolver, HashContent };

const resolver = new SubjectRequestResolver(
  [
    new SubjectSegmentFixedStrategy("ping"),
    new SubjectSegmentPathStrategy(),
    new SubjectSegmentUserStrategy(),
  ],
  deps,
);

const shieldRateLimit = new ShieldRateLimitHonoStrategy({ resolver, window: ttl }, { Clock, CacheResolver });

const onError = (error: Error, c: Context) => {
  if (error.message === ShieldRateLimitStrategyError.Rejected) {
    return c.json({ message: ShieldRateLimitStrategyError.Rejected, _known: true }, 429);
  }
  return c.json({}, 500);
};

const app = new Hono()
  .use(shieldRateLimit.handle())
  .get("/ping", (c) => c.text("pong"))
  .onError(onError);

describe("ShieldRateLimitHonoStrategy", () => {
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
    expect(json.message).toEqual("shield.rate.limit.rejected");

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
    const shield = new ShieldRateLimitHonoStrategy({ resolver, window: ttl }, { Clock, CacheResolver });
    const app = new Hono<mocks.Config>()
      .get(
        "/ping",
        (context, next) => {
          context.set("user", { id: "abc" });
          return next();
        },
        shield.handle(),
        (c) => c.text("pong"),
      )
      .onError(onError);

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);
    expect((await app.request("/ping", { method: "GET" })).status).toEqual(429);

    await CacheResolver.flush();
  });

  test("user - happy path - after rate limit", async () => {
    const shield = new ShieldRateLimitHonoStrategy({ resolver, window: ttl }, { Clock, CacheResolver });
    const app = new Hono<mocks.Config>()
      .get(
        "/ping",
        (context, next) => {
          context.set("user", { id: "abc" });
          return next();
        },
        shield.handle(),
        (c) => c.text("pong"),
      )
      .onError(onError);

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    Clock.advanceBy(tools.Duration.Seconds(5));

    expect((await app.request("/ping", { method: "GET" })).status).toEqual(200);

    await CacheResolver.flush();
  });

  test("user - does not impact other users", async () => {
    const shield = new ShieldRateLimitHonoStrategy({ resolver, window: ttl }, { Clock, CacheResolver });
    const app = new Hono<mocks.Config>()
      .get(
        "/ping",
        (context, next) => {
          context.set("user", { id: context.req.header("id") });
          return next();
        },
        shield.handle(),
        (c) => c.text("pong"),
      )
      .onError(onError);

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
});
