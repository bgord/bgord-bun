import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { ShieldRateLimitExpressStrategy } from "../src/shield-rate-limit-express.strategy";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { SubjectSegmentPathStrategy } from "../src/subject-segment-path.strategy";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";

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

const shieldRateLimit = new ShieldRateLimitExpressStrategy(
  { resolver, window: ttl },
  { Clock, CacheResolver },
);

const app = express()
  .use(shieldRateLimit.handle())
  .get("/ping", (_request, response) => response.send("pong"));

describe("ShieldRateLimitExpressStrategy", () => {
  test("anon - happy path - within rate limit", async () => {
    const result = await request(app).get("/ping");

    expect(result.status).toEqual(200);
    expect(result.text).toEqual("pong");

    await CacheResolver.flush();
  });

  test("anon - failure - TooManyRequestsError", async () => {
    expect((await request(app).get("/ping")).status).toEqual(200);

    const failure = await request(app).get("/ping");

    expect(failure.status).toEqual(429);
    expect(failure.body.message).toEqual("shield.rate.limit.rejected");

    await CacheResolver.flush();
  });

  test("anon - happy path - after rate limit", async () => {
    expect((await request(app).get("/ping")).status).toEqual(200);

    Clock.advanceBy(tools.Duration.Seconds(5));

    expect((await request(app).get("/ping")).status).toEqual(200);

    await CacheResolver.flush();
  });

  test("user - happy path - within rate limit", async () => {
    const result = await request(app).get("/ping");

    expect(result.status).toEqual(200);
    expect(result.text).toEqual("pong");

    await CacheResolver.flush();
  });

  test("user - failure - TooManyRequestsError", async () => {
    const shield = new ShieldRateLimitExpressStrategy({ resolver, window: ttl }, { Clock, CacheResolver });
    const app = express().get(
      "/ping",
      (req, _res, next) => {
        (req as any).user = { id: "abc" };
        next();
      },
      shield.handle(),
      (_request, response) => response.send("pong"),
    );

    expect((await request(app).get("/ping")).status).toEqual(200);
    expect((await request(app).get("/ping")).status).toEqual(429);

    await CacheResolver.flush();
  });

  test("user - happy path - after rate limit", async () => {
    const shield = new ShieldRateLimitExpressStrategy({ resolver, window: ttl }, { Clock, CacheResolver });
    const app = express().get(
      "/ping",
      (req, _res, next) => {
        (req as any).user = { id: "abc" };
        next();
      },
      shield.handle(),
      (_request, response) => response.send("pong"),
    );

    expect((await request(app).get("/ping")).status).toEqual(200);

    Clock.advanceBy(tools.Duration.Seconds(5));

    expect((await request(app).get("/ping")).status).toEqual(200);

    await CacheResolver.flush();
  });

  test("user - does not impact other users", async () => {
    const shield = new ShieldRateLimitExpressStrategy({ resolver, window: ttl }, { Clock, CacheResolver });
    const app = express().get(
      "/ping",
      (req, _res, next) => {
        (req as any).user = { id: req.get("id") };
        next();
      },
      shield.handle(),
      (_request, response) => response.send("pong"),
    );

    const firstUserFirstRequest = await request(app).get("/ping").set("id", "abc");

    expect(firstUserFirstRequest.status).toEqual(200);

    const secondUserFirstRequest = await request(app).get("/ping").set("id", "def");

    expect(secondUserFirstRequest.status).toEqual(200);

    const secondUserSecondRequest = await request(app).get("/ping").set("id", "def");

    expect(secondUserSecondRequest.status).toEqual(429);

    Clock.advanceBy(tools.Duration.Seconds(5));
    const firstUserSecondRequest = await request(app).get("/ping").set("id", "abc");

    expect(firstUserSecondRequest.status).toEqual(200);

    await CacheResolver.flush();
  });
});
