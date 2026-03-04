import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { BuildInfoRepositoryNoopStrategy } from "../src/build-info-repository-noop.strategy";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import type { ETagVariables } from "../src/etag-extractor-hono.middleware";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { UNINFORMATIVE_HEADERS } from "../src/http-logger.middleware";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { Setup } from "../src/setup.service";
import { TimeZoneOffsetMiddleware } from "../src/time-zone-offset.middleware";
import type { TimeZoneOffsetVariables } from "../src/time-zone-offset-hono.middleware";
import * as mocks from "./mocks";

type Config = { Variables: TimeZoneOffsetVariables & ETagVariables };

const I18n = { supportedLanguages: { pl: "pl", en: "en" }, defaultLanguage: "pl" } as const;

const APP_ORIGIN = "http://localhost:3000";
const EVIL_ORIGIN = "https://evil.example";
const csrf = { origin: [] };

const version = "1.2.3";

const IdProvider = new IdProviderDeterministicAdapter([
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
]);
const Logger = new LoggerNoopAdapter();
const Clock = new ClockSystemAdapter();
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "infinite" });
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256Strategy();
const BuildInfoRepository = new BuildInfoRepositoryNoopStrategy(
  mocks.TIME_ZERO,
  tools.PackageVersion.fromString(version),
  mocks.SHA,
  tools.Size.fromBytes(0),
);

const deps = {
  Logger,
  I18n,
  IdProvider,
  Clock,
  CacheResolver,
  HashContent,
  BuildInfoRepository,
};

describe("Setup service", () => {
  test("maintenance mode", async () => {
    const app = new Hono<Config>()
      .use(...Setup.essentials({ csrf, maintenanceMode: { enabled: true } }, deps))
      .get("/ping", (c) => c.text("OK"));

    const response = await app.request("/ping", { method: "GET" }, mocks.connInfo);

    expect(await response.json()).toEqual({ reason: "maintenance" });
    expect(response.headers.toJSON()).toEqual({
      "content-type": "application/json",
      "retry-after": tools.Duration.Hours(1).seconds.toString(),
    });
  });

  test("trailing slash trim", async () => {
    const app = new Hono().use(...Setup.essentials({ csrf }, deps)).get("/data", (c) => c.text("ok"));

    const response = await app.request("/data/", {}, mocks.connInfo);

    expect(response.status).toEqual(301);
    expect(response.headers.get("location")).toEqual("http://localhost/data");
  });

  test("requestId - forwarding", async () => {
    const app = new Hono<Config>()
      .use(...Setup.essentials({ csrf }, deps))
      .get("/ping", (c) => c.json({ requestId: c.get("requestId") }));

    const response = await app.request(
      "/ping",
      { method: "GET", headers: new Headers({ "x-correlation-id": mocks.correlationId }) },
      mocks.connInfo,
    );

    expect(response.headers.get("x-correlation-id")).toEqual(mocks.correlationId);
  });

  test("requestId - generation", async () => {
    const app = new Hono<Config>()
      .use(...Setup.essentials({ csrf }, deps))
      .get("/ping", (c) => c.json({ requestId: c.get("requestId") }));

    const response = await app.request("/ping", { method: "GET" }, mocks.connInfo);

    expect(response.headers.get("x-correlation-id")).toEqual(mocks.correlationId);
  });

  test("api-version", async () => {
    const app = new Hono<Config>()
      .use(...Setup.essentials({ csrf }, deps))
      .get("/ping", (c) => c.json({ requestId: c.get("requestId") }));

    const response = await app.request("/ping", { method: "GET" }, mocks.connInfo);

    expect(response.headers.get("api-version")).toEqual(version);
  });

  test("csrf", async () => {
    const app = new Hono<Config>()
      .use(...Setup.essentials({ csrf: { origin: [APP_ORIGIN] } }, deps))
      .post("/action", (c) => c.text("ok"));

    const response = await app.request("/action", { method: "POST", headers: { Origin: EVIL_ORIGIN } });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.csrf.rejected");
  });

  test("secure headers", async () => {
    const app = new Hono<Config>().use(...Setup.essentials({ csrf }, deps)).get("/ping", (c) =>
      c.json({
        requestId: c.get("requestId"),
        timeZoneOffset: c.get("timeZoneOffset"),
        language: c.get("language"),
        etag: c.get("ETag"),
        weakEtag: c.get("WeakETag"),
      }),
    );

    const response = await app.request("/ping", { method: "GET" }, mocks.connInfo);

    expect(await response.json()).toEqual({
      requestId: mocks.correlationId,
      timeZoneOffset: 0,
      language: I18n.defaultLanguage,
      etag: null,
      weakEtag: null,
    });
    expect(response.headers.toJSON()).toEqual({
      "content-type": "application/json",
      "server-timing": expect.any(String),
      "referrer-policy": "no-referrer",
      "strict-transport-security": "max-age=15552000; includeSubDomains",
      "x-content-type-options": "nosniff",
      "x-xss-protection": "0",
      "api-version": version,
      vary: "Origin",
      "x-correlation-id": mocks.correlationId,
      "x-download-options": "noopen",
    });
  });

  test("bodyLimit", async () => {
    const txt = new File([], "data.txt");
    const form = new FormData();
    form.append("file", txt);

    const app = new Hono<Config>()
      .use(...Setup.essentials({ csrf, BODY_LIMIT_MAX_SIZE: tools.Size.fromBytes(2) }, deps))
      .post("/upload", async (c) => {
        await c.req.parseBody();

        return c.text("OK");
      });

    const response = await app.request("/upload", { method: "POST", body: form }, mocks.connInfo);

    expect(response.status).toEqual(413);
  });

  test("cors - server-to-server allowed", async () => {
    const app = new Hono().use(...Setup.essentials({ csrf }, deps)).get("/cors", (c) => c.text("ok"));

    const response = await app.request("/cors", {}, mocks.connInfo);

    expect(response.status).toEqual(200);
    expect(response.headers.get("access-control-allow-origin")).toEqual(null);
  });

  test("cors - same-origin fetch allowed", async () => {
    const app = new Hono().use(...Setup.essentials({ csrf }, deps)).get("/cors", (c) => c.text("ok"));

    const response = await app.request("/cors", { headers: { Origin: "http://localhost" } }, mocks.connInfo);

    expect(response.status).toEqual(200);
    expect(response.headers.get("access-control-allow-origin")).toEqual("http://localhost");
  });

  test("cors - cross-origin fetch blocked", async () => {
    const app = new Hono().use(...Setup.essentials({ csrf }, deps)).get("/cors", (c) => c.text("ok"));

    const response = await app.request(
      "/cors",
      { headers: { Origin: "https://evil.example" } },
      mocks.connInfo,
    );

    expect(response.status).toEqual(200);
    expect(response.headers.get("access-control-allow-origin")).toEqual(null);
  });

  test("cors - cross-origin preflight blocked", async () => {
    const app = new Hono().use(...Setup.essentials({ csrf }, deps)).options("/cors", (c) => c.text("ok"));

    const response = await app.request("/cors", {
      method: "OPTIONS",
      headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "POST" },
    });

    expect(response.headers.get("access-control-allow-origin")).toEqual(null);
  });

  test("cors - overrides", async () => {
    const origin = "https://some.example";

    const app = new Hono()
      .use(...Setup.essentials({ csrf, cors: { origin } }, deps))
      .get("/cors", (c) => c.text("ok"));

    const response = await app.request("/cors", { headers: { Origin: origin } }, mocks.connInfo);

    expect(response.status).toEqual(200);
    expect(response.headers.get("access-control-allow-origin")).toEqual(origin);
  });

  test("languageDetector - default", async () => {
    const app = new Hono()
      .use(...Setup.essentials({ csrf }, deps))
      .get("/lang", (c) => c.text(c.get("language")));

    const response = await app.request(
      "/lang",
      { headers: { "Accept-Language": "pl-PL,pl;q=0.9" } },
      mocks.connInfo,
    );

    expect(await response.text()).toEqual(I18n.supportedLanguages.pl);
  });

  test("languageDetector - en", async () => {
    const app = new Hono()
      .use(...Setup.essentials({ csrf }, deps))
      .get("/lang", (c) => c.text(c.get("language")));

    const response = await app.request(
      "/lang",
      { headers: { "Accept-Language": "en-EN,en;q=0.9" } },
      mocks.connInfo,
    );

    expect(await response.text()).toEqual(I18n.supportedLanguages.en);
  });

  test("languageDetector - fallback", async () => {
    const app = new Hono()
      .use(...Setup.essentials({ csrf }, deps))
      .get("/lang", (c) => c.text(c.get("language")));

    const response = await app.request(
      "/lang",
      { headers: { "Accept-Language": "de-DE,de;q=0.9" } },
      mocks.connInfo,
    );
    const language = await response.text();

    expect(language).toEqual(I18n.defaultLanguage);
  });

  test("time zone offset", async () => {
    const app = new Hono<Config>()
      .use(...Setup.essentials({ csrf }, deps))
      .get("/ping", (c) => c.json({ timeZoneOffset: c.get("timeZoneOffset") }));

    const response = await app.request(
      "/ping",
      {
        method: "GET",
        headers: new Headers({ [TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME]: "120" }),
      },
      mocks.connInfo,
    );

    expect(await response.json()).toEqual({ timeZoneOffset: tools.Duration.Hours(2).ms });
  });

  test("context", async () => {
    const app = new Hono<Config>()
      .use(...Setup.essentials({ csrf }, deps))
      .get("/ping", (c) =>
        c.json({ requestId: c.get("requestId"), timeZoneOffset: c.get("timeZoneOffset") }),
      );

    const response = await app.request("/ping", { method: "GET" }, mocks.connInfo);

    expect(await response.json()).toEqual({ requestId: mocks.correlationId, timeZoneOffset: 0 });
  });

  test("weak etag extractor", async () => {
    const app = new Hono<Config>()
      .use(...Setup.essentials({ csrf }, deps))
      .get("/ping", (c) => c.json(c.get("WeakETag")));

    const response = await app.request(
      "/ping",
      { method: "GET", headers: new Headers({ [tools.WeakETag.IF_MATCH_HEADER_NAME]: "W/12345" }) },
      mocks.connInfo,
    );

    expect(await response.json()).toEqual({ revision: 12345, value: "W/12345" });
  });

  test("etag extractor", async () => {
    const app = new Hono<Config>()
      .use(...Setup.essentials({ csrf }, deps))
      .get("/ping", (c) => c.json(c.get("ETag")));

    const response = await app.request(
      "/ping",
      { method: "GET", headers: new Headers({ [tools.ETag.IF_MATCH_HEADER_NAME]: "12345" }) },
      mocks.connInfo,
    );

    expect(await response.json()).toEqual({ revision: 12345, value: "12345" });
  });

  test("http logger", async () => {
    using loggerHttp = spyOn(Logger, "http");

    const app = new Hono<Config>()
      .use(...Setup.essentials({ csrf }, deps))
      .get("/ping", (c) => c.json({ message: "OK" }));

    const headers = UNINFORMATIVE_HEADERS.reduce((result, header) => ({ ...result, [header]: "abc" }), {});

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

  test("timing", async () => {
    const app = new Hono<Config>().use(...Setup.essentials({ csrf }, deps)).get("/ping", (c) => c.json({}));

    const response = await app.request("/ping", { method: "GET" }, mocks.connInfo);

    expect(response.headers.get("server-timing")).toEqual(expect.any(String));
  });

  test("correlation storage - seeding", async () => {
    const app = new Hono<Config>()
      .use(...Setup.essentials({ csrf }, deps))
      .get("/ping", (c) => c.text(CorrelationStorage.get()));

    const response = await app.request("/ping", { method: "GET" }, mocks.connInfo);

    expect(await response.text()).toEqual(mocks.correlationId);
    expect(response.status).toEqual(200);
  });

  test("correlation storage - cleanup", async () => {
    const app = new Hono<Config>().use(...Setup.essentials({ csrf }, deps)).get("/ping", (c) => c.json({}));

    await app.request("/ping", { method: "GET" }, mocks.connInfo);

    expect(() => CorrelationStorage.get()).toThrow("correlation.storage.missing");
  });
});
