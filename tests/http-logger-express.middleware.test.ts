import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
// import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
// import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
// import { CacheResponseExpressMiddleware } from "../src/cache-response-express.middleware";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { CorrelationExpressMiddleware } from "../src/correlation-express.middleware";
// import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { UNINFORMATIVE_HEADERS } from "../src/http-logger.middleware";
import { HttpLoggerExpressMiddleware } from "../src/http-logger-express.middleware";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
// import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
// import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { TimingExpressMiddleware } from "../src/timing-express.middleware";
import * as mocks from "./mocks";

const headers = UNINFORMATIVE_HEADERS.reduce((result, header) => ({ ...result, [header]: "123" }), {});

const Logger = new LoggerNoopAdapter();
const Clock = new ClockSystemAdapter();
const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 8));
const deps = { Logger, Clock, IdProvider };

// const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl: tools.Duration.Hours(1) });
// const HashContent = new HashContentSha256Strategy();
// const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
// const resolver = new SubjectRequestResolver([new SubjectSegmentFixedStrategy("ping")], {
//   HashContent,
// });
// const cacheResponse = new CacheResponseExpressMiddleware({ enabled: true, resolver }, { CacheResolver });

const app = express();

app.use(express.json());
app.use(new CorrelationExpressMiddleware(deps).handle());
app.use(new HttpLoggerExpressMiddleware(deps, { skip: ["/i18n/", "/other"] }).handle());
app.use(new TimingExpressMiddleware(deps).handle());

app.get("/ping", (_req, res) => {
  res.locals.body = { message: "OK" };
  res.json({ message: "OK" });
});

// app.get("/ping-cached", cacheResponse.handle(), (req, res) => {
//   res.locals.body = { message: "ping" };
//   res.json({ message: "ping" });
// });

app.get("/pong", (_req, res) => {
  res.locals.body = { message: "general.unknown" };
  res.status(500).json({ message: "general.unknown" });
});

app.get("/pang", (_req, res) => {
  res.locals.body = { message: "general.unknown" };
  res.status(400).json({ message: "general.unknown" });
});

app.get("/html", (_req, res) => {
  res.send("<h1>Hello</h1>");
});

app.get("/i18n/en.json", (_req, res) => {
  res.locals.body = { hello: "world" };
  res.json({ hello: "world" });
});

describe("HttpLoggerExpressMiddleware", () => {
  test("200", async () => {
    using loggerHttp = spyOn(Logger, "http");

    const result = await request(app)
      .get("/ping?page=1")
      .set({ keep: "123", ...headers });

    expect(result.status).toEqual(200);
    expect(loggerHttp).toHaveBeenCalledTimes(2);
    expect(loggerHttp).toHaveBeenNthCalledWith(1, {
      component: "http",
      operation: "http_request_before",
      correlationId: mocks.correlationId,
      message: "request",
      method: "GET",
      url: expect.stringContaining("/ping?page=1"),
      client: { ip: expect.any(String), ua: "123" },
      metadata: { headers: { keep: "123" }, body: {}, params: {}, query: { page: "1" } },
    });
    expect(loggerHttp).toHaveBeenNthCalledWith(2, {
      component: "http",
      operation: "http_request_after",
      correlationId: mocks.correlationId,
      message: "response",
      method: "GET",
      url: expect.stringContaining("/ping?page=1"),
      status: 200,
      durationMs: expect.any(Number),
      client: { ip: expect.any(String), ua: "123" },
      cacheHit: false,
      metadata: { response: { message: "OK" } },
    });
  });

  test("400", async () => {
    using loggerHttp = spyOn(Logger, "http");
    using loggerError = spyOn(Logger, "error");

    const result = await request(app).get("/pang");

    expect(result.status).toEqual(400);
    expect(loggerHttp).toHaveBeenCalledTimes(1);
    expect(loggerHttp).toHaveBeenNthCalledWith(1, {
      operation: "http_request_before",
      component: "http",
      correlationId: mocks.correlationId,
      message: "request",
      method: "GET",
      url: expect.stringContaining("/pang"),
      client: { ip: expect.any(String), ua: "Bun/1.3.10" },
      metadata: { headers: {}, body: {}, params: {}, query: {} },
    });
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenNthCalledWith(1, {
      operation: "http_request_after",
      component: "http",
      correlationId: mocks.correlationId,
      message: "response",
      method: "GET",
      url: expect.stringContaining("/pang"),
      status: 400,
      durationMs: expect.any(Number),
      client: { ip: expect.any(String), ua: "Bun/1.3.10" },
      cacheHit: false,
      metadata: { response: { message: "general.unknown" } },
    });
  });

  test("500", async () => {
    using loggerHttp = spyOn(Logger, "http");
    using loggerError = spyOn(Logger, "error");

    const result = await request(app).get("/pong");

    expect(result.status).toEqual(500);
    expect(loggerHttp).toHaveBeenCalledTimes(1);
    expect(loggerHttp).toHaveBeenNthCalledWith(1, {
      operation: "http_request_before",
      component: "http",
      correlationId: mocks.correlationId,
      message: "request",
      method: "GET",
      url: expect.stringContaining("/pong"),
      client: { ip: expect.any(String), ua: "Bun/1.3.10" },
      metadata: { headers: {}, body: {}, params: {}, query: {} },
    });
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenNthCalledWith(1, {
      operation: "http_request_after",
      component: "http",
      correlationId: mocks.correlationId,
      message: "response",
      method: "GET",
      url: expect.stringContaining("/pong"),
      status: 500,
      durationMs: expect.any(Number),
      client: { ip: expect.any(String), ua: "Bun/1.3.10" },
      cacheHit: false,
      metadata: { response: { message: "general.unknown" } },
    });
  });

  test("response parsing error", async () => {
    using loggerHttp = spyOn(Logger, "http");

    const result = await request(app).get("/html");

    expect(result.status).toEqual(200);
    expect(loggerHttp).toHaveBeenNthCalledWith(2, {
      operation: "http_request_after",
      component: "http",
      correlationId: mocks.correlationId,
      message: "response",
      method: "GET",
      url: expect.stringContaining("/html"),
      status: 200,
      durationMs: expect.any(Number),
      client: { ip: expect.any(String), ua: "Bun/1.3.10" },
      cacheHit: false,
      metadata: { response: undefined },
    });
  });

  test("skip", async () => {
    using loggerHttp = spyOn(Logger, "http");

    const result = await request(app).get("/i18n/en.json");

    expect(result.status).toEqual(200);
    expect(loggerHttp).not.toHaveBeenCalled();
  });

  // test("cache-hit", async () => {
  //   using loggerHttp = spyOn(Logger, "http");

  //   const first = await request(app).get("/ping-cached");

  //   expect(first.status).toEqual(200);
  //   expect(loggerHttp).toHaveBeenNthCalledWith(2, expect.objectContaining({ cacheHit: false }));

  //   const second = await request(app).get("/ping-cached");

  //   expect(second.status).toEqual(200);
  //   expect(loggerHttp).toHaveBeenNthCalledWith(4, expect.objectContaining({ cacheHit: true }));
  // });
});
