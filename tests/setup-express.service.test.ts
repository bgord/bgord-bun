import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { BuildInfoRepositoryNoopStrategy } from "../src/build-info-repository-noop.strategy";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { UNINFORMATIVE_HEADERS } from "../src/http-logger.middleware";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SetupExpress } from "../src/setup-express.service";
import { TimeZoneOffsetMiddleware } from "../src/time-zone-offset.middleware";
import * as mocks from "./mocks";

const I18n = { supportedLanguages: { pl: "pl", en: "en" }, defaultLanguage: "pl" } as const;

const APP_ORIGIN = "http://localhost:3000";
const EVIL_ORIGIN = "https://evil.example";
const csrf = { origin: [] };

const version = "1.2.3";

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
  Clock,
  CacheResolver,
  HashContent,
  BuildInfoRepository,
};

describe("SetupExpress", () => {
  test("maintenance", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    SetupExpress.essentials(app, { csrf, maintenanceMode: { enabled: true } }, { ...deps, IdProvider });
    app.get("/ping", (_req, res) => res.send("OK"));

    const response = await request(app).get("/ping");

    expect(response.body).toEqual({ reason: "maintenance" });
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.headers["retry-after"]).toEqual(tools.Duration.Hours(1).seconds.toString());
  });

  test("trailing slash trim", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/data", (_req, res) => res.send("ok"));

    const response = await request(app).get("/data/");

    expect(response.status).toEqual(301);
    expect(response.headers.location).toMatch(/\/data$/);
  });

  test("correlation - forwarding", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    app.use(express.json());
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/ping", (req, res) => res.json({ correlationId: (req as any).correlationId }));

    const response = await request(app).get("/ping").set("correlation-id", mocks.correlationId);

    expect(response.headers["correlation-id"]).toEqual(mocks.correlationId);
  });

  test("correlation - generation", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    app.use(express.json());
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/ping", (req, res) => res.json({ correlationId: (req as any).correlationId }));

    const response = await request(app).get("/ping");

    expect(response.headers["correlation-id"]).toEqual(mocks.correlationId);
  });

  test("api-version", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    app.use(express.json());
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/ping", (req, res) => res.json({ correlationId: (req as any).correlationId }));

    const response = await request(app).get("/ping");

    expect(response.headers["api-version"]).toEqual(version);
  });

  test("csrf", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    app.use(express.json());
    SetupExpress.essentials(app, { csrf: { origin: [APP_ORIGIN] } }, { ...deps, IdProvider });
    app.post("/action", (_req, res) => res.send("ok"));

    const response = await request(app).post("/action").set("Origin", EVIL_ORIGIN);

    expect(response.status).toEqual(403);
    expect(response.text).toEqual("shield.csrf.rejected");
  });

  test("secure headers", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    app.use(express.json());
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/ping", (req, res) =>
      res.json({
        correlationId: (req as any).correlationId,
        timeZoneOffset: (req as any).timeZoneOffset,
        language: (req as any).language,
        etag: (req as any).ETag,
        weakEtag: (req as any).WeakETag,
      }),
    );

    const response = await request(app).get("/ping");

    expect(response.body).toEqual({
      correlationId: mocks.correlationId,
      timeZoneOffset: 0,
      language: I18n.defaultLanguage,
      etag: null,
      weakEtag: null,
    });
    expect(response.headers["server-timing"]).toBeDefined();
    expect(response.headers["referrer-policy"]).toEqual("no-referrer");
    expect(response.headers["strict-transport-security"]).toEqual("max-age=15552000; includeSubDomains");
    expect(response.headers["x-content-type-options"]).toEqual("nosniff");
    expect(response.headers["x-xss-protection"]).toEqual("0");
    expect(response.headers["api-version"]).toEqual(version);
    expect(response.headers["correlation-id"]).toEqual(mocks.correlationId);
    expect(response.headers["x-download-options"]).toEqual("noopen");
  });

  test("cors - server-to-server allowed", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/cors", (_req, res) => res.send("ok"));

    const response = await request(app).get("/cors");

    expect(response.status).toEqual(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("cors - same-origin fetch allowed", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/cors", (_req, res) => res.send("ok"));

    const response = await request(app).get("/cors").set("Origin", "http://127.0.0.1");

    expect(response.status).toEqual(200);
    expect(response.headers["access-control-allow-origin"]).toEqual("http://127.0.0.1");
  });

  test("cors - cross-origin fetch blocked", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/cors", (_req, res) => res.send("ok"));

    const response = await request(app).get("/cors").set("Origin", "https://evil.example");

    expect(response.status).toEqual(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("cors - cross-origin preflight blocked", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.options("/cors", (_req, res) => res.send("ok"));

    const response = await request(app)
      .options("/cors")
      .set("Origin", "https://evil.example")
      .set("Access-Control-Request-Method", "POST");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("cors - overrides", async () => {
    const origin = "https://some.example";

    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    SetupExpress.essentials(app, { csrf, cors: { origin } }, { ...deps, IdProvider });
    app.get("/cors", (_req, res) => res.send("ok"));

    const response = await request(app).get("/cors").set("Origin", origin);

    expect(response.status).toEqual(200);
    expect(response.headers["access-control-allow-origin"]).toEqual(origin);
  });

  test("languageDetector - default", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/lang", (req, res) => res.send((req as any).language));

    const response = await request(app).get("/lang").set("Accept-Language", "pl-PL,pl;q=0.9");

    expect(response.text).toEqual(I18n.supportedLanguages.pl);
  });

  test("languageDetector - en", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/lang", (req, res) => res.send((req as any).language));

    const response = await request(app).get("/lang").set("Accept-Language", "en-EN,en;q=0.9");

    expect(response.text).toEqual(I18n.supportedLanguages.en);
  });

  test("languageDetector - fallback", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/lang", (req, res) => res.send((req as any).language));

    const response = await request(app).get("/lang").set("Accept-Language", "de-DE,de;q=0.9");

    expect(response.text).toEqual(I18n.defaultLanguage);
  });

  test("time zone offset", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    app.use(express.json());
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/ping", (req, res) => res.json({ timeZoneOffset: (req as any).timeZoneOffset }));

    const response = await request(app)
      .get("/ping")
      .set(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "120");

    expect(response.body).toEqual({ timeZoneOffset: tools.Duration.Hours(2).ms });
  });

  test("weak etag extractor", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    app.use(express.json());
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/ping", (req, res) => res.json((req as any).WeakETag));

    const response = await request(app).get("/ping").set(tools.WeakETag.IF_MATCH_HEADER_NAME, "W/12345");

    expect(response.body).toEqual({ revision: 12345, value: "W/12345" });
  });

  test("etag extractor", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    app.use(express.json());
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/ping", (req, res) => res.json((req as any).ETag));

    const response = await request(app).get("/ping").set(tools.ETag.IF_MATCH_HEADER_NAME, "12345");

    expect(response.body).toEqual({ revision: 12345, value: "12345" });
  });

  test("http logger", async () => {
    using loggerHttp = spyOn(Logger, "http");

    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    app.use(express.json());
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/ping", (_req, res) => {
      res.locals.body = { message: "OK" };
      res.json({ message: "OK" });
    });

    const headers = UNINFORMATIVE_HEADERS.reduce((result, header) => ({ ...result, [header]: "123" }), {});

    const result = await request(app)
      .get("/ping?page=1")
      .set({ keep: "123", ...headers });

    expect(result.status).toEqual(200);
    expect(loggerHttp).toHaveBeenCalledTimes(2);
    expect(loggerHttp).toHaveBeenNthCalledWith(1, {
      client: { ip: "::ffff:127.0.0.1", ua: "123" },
      component: "http",
      operation: "http_request_before",
      correlationId: mocks.correlationId,
      message: "request",
      method: "GET",
      metadata: { body: {}, headers: { keep: "123" }, params: {}, query: { page: "1" } },
      url: expect.stringContaining("/ping?page=1"),
    });
    expect(loggerHttp).toHaveBeenNthCalledWith(2, {
      client: { ip: "::ffff:127.0.0.1", ua: "123" },
      component: "http",
      operation: "http_request_after",
      correlationId: mocks.correlationId,
      message: "response",
      method: "GET",
      status: 200,
      cacheHit: false,
      metadata: { response: { message: "OK" } },
      durationMs: expect.any(Number),
      url: expect.stringContaining("/ping?page=1"),
    });
  });

  test("timing", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    app.use(express.json());
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/ping", (_req, res) => res.json({}));

    const response = await request(app).get("/ping");

    expect(response.headers["server-timing"]).toBeDefined();
  });

  test("correlation storage - seeding", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/ping", (_req, res) => res.send(CorrelationStorage.get()));

    const response = await request(app).get("/ping");

    expect(response.text).toEqual(mocks.correlationId);
    expect(response.status).toEqual(200);
  });

  test("correlation storage - cleanup", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const app = express();
    app.use(express.json());
    SetupExpress.essentials(app, { csrf }, { ...deps, IdProvider });
    app.get("/ping", (_req, res) => res.json({}));

    await request(app).get("/ping");

    expect(() => CorrelationStorage.get()).toThrow("correlation.storage.missing");
  });
});
