import { afterEach, beforeEach, describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheSourceEnum } from "../src/cache-resolver.strategy";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheResponseMiddleware } from "../src/cache-response.middleware";
import { CacheResponseExpressMiddleware } from "../src/cache-response-express.middleware";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { SubjectSegmentPathStrategy } from "../src/subject-segment-path.strategy";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";

const config = { type: "finite", ttl: tools.Duration.Hours(1) } as const;
const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256Strategy();
const deps = { HashContent };

const resolver = new SubjectRequestResolver(
  [
    new SubjectSegmentFixedStrategy("ping"),
    new SubjectSegmentPathStrategy(),
    new SubjectSegmentUserStrategy(),
  ],
  deps,
);

const cacheResponse = new CacheResponseExpressMiddleware({ enabled: true, resolver }, { CacheResolver });
const cacheResponseDisabled = new CacheResponseExpressMiddleware(
  { enabled: false, resolver },
  { CacheResolver },
);

const app = express();

app.use(express.json());
app.use((request, _, next) => {
  (request as any).user = { id: request.header("id") };
  next();
});

app.get("/ping-cached", cacheResponse.handle(), (_, res) => {
  res.locals.body = { message: "ping" };
  res.json({ message: "ping" });
});

app.post("/clear", cacheResponse.clear(), (_, res) => {
  res.locals.body = { message: "cleared" };
  res.json({ message: "cleared" });
});

describe("CacheResponseExpressMiddleware", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(async () => {
    jest.useRealTimers();
    await CacheResolver.flush();
  });

  test("miss - uncached request", async () => {
    const response = await request(app).get("/ping-cached");

    expect(response.status).toEqual(200);
    expect(response.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.miss,
    );
    expect(response.body.message).toEqual("ping");
  });

  test("hit - request is cached", async () => {
    const firstResponse = await request(app).get("/ping-cached");

    expect(firstResponse.status).toEqual(200);
    expect(firstResponse.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.miss,
    );
    expect(firstResponse.body.message).toEqual("ping");

    const secondResponse = await request(app).get("/ping-cached");

    expect(secondResponse.status).toEqual(200);
    expect(secondResponse.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.hit,
    );
    expect(secondResponse.body.message).toEqual("ping");
  });

  test("miss - cache has expired", async () => {
    const firstResponse = await request(app).get("/ping-cached");

    expect(firstResponse.status).toEqual(200);
    expect(firstResponse.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.miss,
    );
    expect(firstResponse.body.message).toEqual("ping");

    const secondResponse = await request(app).get("/ping-cached");

    expect(secondResponse.status).toEqual(200);
    expect(secondResponse.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.hit,
    );
    expect(secondResponse.body.message).toEqual("ping");

    jest.advanceTimersByTime(tools.Duration.Hours(2).ms);

    const thirdResponse = await request(app).get("/ping-cached");

    expect(thirdResponse.status).toEqual(200);
    expect(thirdResponse.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.miss,
    );
    expect(thirdResponse.body.message).toEqual("ping");
  });

  test("miss - clearing the cache", async () => {
    const firstResponse = await request(app).get("/ping-cached");

    expect(firstResponse.status).toEqual(200);
    expect(firstResponse.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.miss,
    );
    expect(firstResponse.body.message).toEqual("ping");

    const secondResponse = await request(app).get("/ping-cached");

    expect(secondResponse.status).toEqual(200);
    expect(secondResponse.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.hit,
    );
    expect(secondResponse.body.message).toEqual("ping");

    await CacheResolver.flush();

    const fourthResponse = await request(app).get("/ping-cached");

    expect(fourthResponse.status).toEqual(200);
    expect(fourthResponse.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.miss,
    );
    expect(fourthResponse.body.message).toEqual("ping");
  });

  test("hit for one user, miss for another", async () => {
    const firstResponseAdam = await request(app).get("/ping-cached").set("id", "Adam");

    expect(firstResponseAdam.status).toEqual(200);
    expect(firstResponseAdam.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.miss,
    );
    expect(firstResponseAdam.body.message).toEqual("ping");

    const secondResponseAdam = await request(app).get("/ping-cached").set("id", "Adam");

    expect(secondResponseAdam.status).toEqual(200);
    expect(secondResponseAdam.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.hit,
    );
    expect(secondResponseAdam.body.message).toEqual("ping");

    const responseEve = await request(app).get("/ping-cached").set("id", "Eve");

    expect(responseEve.status).toEqual(200);
    expect(responseEve.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.miss,
    );
    expect(responseEve.body.message).toEqual("ping");
  });

  test("disabled", async () => {
    using cacheResolverResolve = spyOn(CacheResolver, "resolve");

    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      (req as any).user = { id: req.header("id") };
      next();
    });
    app.get("/ping", cacheResponseDisabled.handle(), (_, res) => {
      res.locals.body = { message: "ping" };
      res.json({ message: "ping" });
    });

    const response = await request(app).get("/ping");

    expect(response.status).toEqual(200);
    expect(response.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toBeUndefined();
    expect(response.body.message).toEqual("ping");
    expect(cacheResolverResolve).not.toHaveBeenCalled();
  });

  test("clear", async () => {
    const firstResponse = await request(app).get("/ping-cached");

    expect(firstResponse.status).toEqual(200);
    expect(firstResponse.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.miss,
    );
    expect(firstResponse.body.message).toEqual("ping");

    await request(app).post("/clear");

    const secondResponse = await request(app).get("/ping-cached");

    expect(secondResponse.status).toEqual(200);
    expect(secondResponse.headers[CacheResponseMiddleware.CACHE_HIT_HEADER.toLowerCase()]).toEqual(
      CacheSourceEnum.miss,
    );
    expect(secondResponse.body.message).toEqual("ping");
  });
});
