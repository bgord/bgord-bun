import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { timing } from "hono/timing";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheResponse } from "../src/cache-response.middleware";
import { CacheSubjectRequestResolver } from "../src/cache-subject-request-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import { HttpLogger, UNINFORMATIVE_HEADERS } from "../src/http-logger.middleware";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const headers = UNINFORMATIVE_HEADERS.reduce((result, header) => ({ ...result, [header]: "abc" }), {});

const Logger = new LoggerNoopAdapter();
const Clock = new ClockSystemAdapter();
const deps = { Logger, Clock };

const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl: tools.Duration.Hours(1) });
const HashContent = new HashContentSha256BunStrategy();
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const cacheResponse = new CacheResponse(
  {
    enabled: true,
    resolver: new CacheSubjectRequestResolver([new CacheSubjectSegmentFixedStrategy("ping")], {
      HashContent,
    }),
  },
  { CacheResolver },
);

const app = new Hono()
  .use(requestId())
  .use(HttpLogger.build(deps, { skip: ["/i18n/", "/other"] }))
  .use(timing())
  .get("/ping", (c) => c.json({ message: "OK" }))
  .get("/ping-cached", cacheResponse.handle, (c) => c.json({ message: "ping" }))
  .get("/pong", (c) => c.json({ message: "general.unknown" }, 500))
  .get("/i18n/en.json", (c) => c.json({ hello: "world" }));

describe("HttpLogger middleware", () => {
  test("200", async () => {
    const loggerHttp = spyOn(Logger, "http");

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
      correlationId: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      ),
      message: "request",
      method: "GET",
      url: "http://localhost/ping?page=1",
      client: { ip: mocks.ip, ua: "abc" },
      metadata: { headers: { keep: "abc" }, body: {}, params: {}, query: { page: "1" } },
    });
    expect(loggerHttp).toHaveBeenNthCalledWith(2, {
      component: "http",
      operation: "http_request_after",
      correlationId: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      ),
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

  test("500", async () => {
    const loggerHttp = spyOn(Logger, "http");

    const result = await app.request("/pong", { method: "GET" }, mocks.connInfo);

    expect(result.status).toEqual(500);
    expect(loggerHttp).toHaveBeenCalledTimes(2);
    expect(loggerHttp).toHaveBeenNthCalledWith(1, {
      operation: "http_request_before",
      component: "http",
      correlationId: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      ),
      message: "request",
      method: "GET",
      url: "http://localhost/pong",
      client: { ip: mocks.ip },
      metadata: { headers: {}, body: {}, params: {}, query: {} },
    });
    expect(loggerHttp).toHaveBeenNthCalledWith(2, {
      operation: "http_request_after",
      component: "http",
      correlationId: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      ),
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

  test("client extraction", async () => {
    const result = await app.request(
      "/ping",
      { method: "GET" },
      { server: { requestIP: () => ({ address: "invalid" }) } },
    );

    expect(result.status).toEqual(200);
  });

  test("skip", async () => {
    const loggerHttp = spyOn(Logger, "http");

    const result = await app.request("/i18n/en.json", { method: "GET" }, mocks.connInfo);

    expect(result.status).toEqual(200);
    expect(loggerHttp).not.toHaveBeenCalled();
  });

  test("cache-hit", async () => {
    const loggerHttp = spyOn(Logger, "http");

    const first = await app.request("/ping-cached", {}, mocks.connInfo);

    expect(first.status).toEqual(200);
    expect(loggerHttp).toHaveBeenNthCalledWith(2, expect.objectContaining({ cacheHit: false }));

    const second = await app.request("/ping-cached", {}, mocks.connInfo);

    expect(second.status).toEqual(200);
    expect(loggerHttp).toHaveBeenNthCalledWith(4, expect.objectContaining({ cacheHit: true }));
  });
});
