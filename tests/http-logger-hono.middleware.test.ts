import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheResponseHonoMiddleware } from "../src/cache-response-hono.middleware";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { CorrelationHonoMiddleware } from "../src/correlation-hono.middleware";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { UNINFORMATIVE_HEADERS } from "../src/http-logger.middleware";
import { HttpLoggerHonoMiddleware } from "../src/http-logger-hono.middleware";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { TimingHonoMiddleware } from "../src/timing-hono.middleware";
import * as mocks from "./mocks";

const headers = UNINFORMATIVE_HEADERS.reduce((result, header) => ({ ...result, [header]: "abc" }), {});

const Logger = new LoggerNoopAdapter();
const Clock = new ClockSystemAdapter();
const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 9));
const deps = { Logger, Clock, IdProvider };

const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl: tools.Duration.Hours(1) });
const HashContent = new HashContentSha256Strategy();
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const resolver = new SubjectRequestResolver([new SubjectSegmentFixedStrategy("ping")], {
  HashContent,
});
const cacheResponse = new CacheResponseHonoMiddleware({ enabled: true, resolver }, { CacheResolver });

const app = new Hono()
  .use(new CorrelationHonoMiddleware(deps).handle())
  .use(new HttpLoggerHonoMiddleware(deps, { skip: ["/i18n/", "/other"] }).handle())
  .use(new TimingHonoMiddleware(deps).handle())
  .get("/ping", (c) => c.json({ message: "OK" }))
  .get("/ping-cached", cacheResponse.handle(), (c) => c.json({ message: "ping" }))
  .get("/pong", (c) => c.json({ message: "general.unknown" }, 500))
  .get("/pang", (c) => c.json({ message: "general.unknown" }, 400))
  .get("/html", (c) => c.html("<h1>Hello</h1>"))
  .get("/i18n/en.json", (c) => c.json({ hello: "world" }));

describe("HttpLoggerHonoMiddleware", () => {
  test("200", async () => {
    using loggerHttp = spyOn(Logger, "http");

    const result = await app.request(
      "/ping?page=1",
      { method: "GET", headers: { keep: "abc", ...headers } },
      mocks.connInfo,
    );

    expect(result.status).toEqual(200);
    expect(loggerHttp).toHaveBeenCalledTimes(2);
    expect(loggerHttp).toHaveBeenNthCalledWith(1, {
      component: "http",
      operation: "http_request_before",
      correlationId: mocks.correlationId,
      message: "request",
      method: "GET",
      url: "http://localhost/ping?page=1",
      client: { ip: mocks.ip, ua: "abc" },
      metadata: { headers: { keep: "abc" }, body: {}, params: {}, query: { page: "1" } },
    });
    expect(loggerHttp).toHaveBeenNthCalledWith(2, {
      component: "http",
      operation: "http_request_after",
      correlationId: mocks.correlationId,
      message: "response",
      method: "GET",
      url: "http://localhost/ping?page=1",
      status: 200,
      durationMs: expect.any(Number),
      client: { ip: mocks.ip, ua: "abc" },
      cacheHit: false,
      metadata: { response: { message: "OK" } },
    });
  });

  test("400", async () => {
    using loggerHttp = spyOn(Logger, "http");
    using loggerError = spyOn(Logger, "error");

    const result = await app.request("/pang", { method: "GET" }, mocks.connInfo);

    expect(result.status).toEqual(400);
    expect(loggerHttp).toHaveBeenCalledTimes(1);
    expect(loggerHttp).toHaveBeenNthCalledWith(1, {
      operation: "http_request_before",
      component: "http",
      correlationId: mocks.correlationId,
      message: "request",
      method: "GET",
      url: "http://localhost/pang",
      client: { ip: mocks.ip },
      metadata: { headers: {}, body: {}, params: {}, query: {} },
    });
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenNthCalledWith(1, {
      operation: "http_request_after",
      component: "http",
      correlationId: mocks.correlationId,
      message: "response",
      method: "GET",
      url: "http://localhost/pang",
      status: 400,
      durationMs: expect.any(Number),
      client: { ip: mocks.ip },
      cacheHit: false,
      metadata: { response: { message: "general.unknown" } },
    });
  });

  test("500", async () => {
    using loggerHttp = spyOn(Logger, "http");
    using loggerError = spyOn(Logger, "error");

    const result = await app.request("/pong", { method: "GET" }, mocks.connInfo);

    expect(result.status).toEqual(500);
    expect(loggerHttp).toHaveBeenCalledTimes(1);
    expect(loggerHttp).toHaveBeenNthCalledWith(1, {
      operation: "http_request_before",
      component: "http",
      correlationId: mocks.correlationId,
      message: "request",
      method: "GET",
      url: "http://localhost/pong",
      client: { ip: mocks.ip },
      metadata: { headers: {}, body: {}, params: {}, query: {} },
    });
    expect(loggerError).toHaveBeenCalledTimes(1);
    expect(loggerError).toHaveBeenNthCalledWith(1, {
      operation: "http_request_after",
      component: "http",
      correlationId: mocks.correlationId,
      message: "response",
      method: "GET",
      url: "http://localhost/pong",
      status: 500,
      durationMs: expect.any(Number),
      client: { ip: mocks.ip },
      cacheHit: false,
      metadata: { response: { message: "general.unknown" } },
    });
  });

  test("response parsing error", async () => {
    using loggerHttp = spyOn(Logger, "http");

    const result = await app.request("/html", { method: "GET" }, mocks.connInfo);

    expect(result.status).toEqual(200);
    expect(loggerHttp).toHaveBeenNthCalledWith(2, {
      operation: "http_request_after",
      component: "http",
      correlationId: mocks.correlationId,
      message: "response",
      method: "GET",
      url: "http://localhost/html",
      status: 200,
      durationMs: expect.any(Number),
      client: { ip: mocks.ip },
      cacheHit: false,
      metadata: { response: undefined },
    });
  });

  test("client extraction", async () => {
    const result = await app.request(
      "/ping",
      { method: "GET" },
      { server: { requestIP: () => ({ address: "invalid" }) } },
    );

    expect(result.status).toEqual(200);
  });

  test("skip - path", async () => {
    using loggerHttp = spyOn(Logger, "http");

    const result = await app.request("/i18n/en.json", { method: "GET" }, mocks.connInfo);

    expect(result.status).toEqual(200);
    expect(loggerHttp).not.toHaveBeenCalled();
  });

  test("skip - path", async () => {
    using loggerHttp = spyOn(Logger, "http");

    const result = await app.request(
      "/i18n/en.json",
      { method: "GET", headers: { accept: "text/event-stream" } },
      mocks.connInfo,
    );

    expect(result.status).toEqual(200);
    expect(loggerHttp).not.toHaveBeenCalled();
  });

  test("cache-hit", async () => {
    using loggerHttp = spyOn(Logger, "http");

    const first = await app.request("/ping-cached", {}, mocks.connInfo);

    expect(first.status).toEqual(200);
    expect(loggerHttp).toHaveBeenNthCalledWith(2, expect.objectContaining({ cacheHit: false }));

    const second = await app.request("/ping-cached", {}, mocks.connInfo);

    expect(second.status).toEqual(200);
    expect(loggerHttp).toHaveBeenNthCalledWith(4, expect.objectContaining({ cacheHit: true }));
  });
});
