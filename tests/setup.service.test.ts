import { describe, expect, jest, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import type { EtagVariables } from "../src/etag-extractor.middleware";
import type { I18nConfigType } from "../src/i18n.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { JsonFileReaderNoopAdapter } from "../src/json-file-reader-noop.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { Setup } from "../src/setup.service";
import type { TimeZoneOffsetVariables } from "../src/time-zone-offset.middleware";

const ip = { server: { requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }) } };
const predefinedRequestId = "123";
const I18n: I18nConfigType = { supportedLanguages: { pl: "pl", en: "en" }, defaultLanguage: "en" };

const JsonFileReader = new JsonFileReaderNoopAdapter({});
const Logger = new LoggerNoopAdapter();
const IdProvider = new IdProviderDeterministicAdapter([predefinedRequestId]);
const Clock = new ClockSystemAdapter();

const app = new Hono<{ Variables: TimeZoneOffsetVariables & EtagVariables }>()
  .use(...Setup.essentials({ Logger, I18n, IdProvider, Clock, JsonFileReader }))
  .get("/ping", (c) =>
    c.json({
      requestId: c.get("requestId"),
      timeZoneOffset: c.get("timeZoneOffset"),
      language: c.get("language"),
      etag: c.get("ETag"),
      weakEtag: c.get("WeakETag"),
    }),
  );

describe("Setup service", () => {
  test("happy path", async () => {
    spyOn(Logger, "http").mockImplementation(jest.fn());

    const response = await app.request(
      "/ping",
      { method: "GET", headers: new Headers({ "x-correlation-id": predefinedRequestId }) },
      ip,
    );
    const json = await response.json();

    expect(response.headers.toJSON()).toMatchObject({
      "access-control-allow-origin": "*",
      "api-version": expect.any(String),
      "content-type": "application/json",
      "cross-origin-opener-policy": "same-origin",
      "cross-origin-resource-policy": "cross-origin",
      "origin-agent-cluster": "?1",
      "referrer-policy": "no-referrer",
      "server-timing": expect.any(String),
      "strict-transport-security": "max-age=15552000; includeSubDomains",
      "x-content-type-options": "nosniff",
      "x-dns-prefetch-control": "off",
      "x-download-options": "noopen",
      "x-frame-options": "SAMEORIGIN",
      "x-permitted-cross-domain-policies": "none",
      "x-correlation-id": predefinedRequestId,
      "x-xss-protection": "0",
    });
    expect(json).toEqual({
      requestId: predefinedRequestId,
      timeZoneOffset: { internal: 0 },
      language: "en",
      etag: null,
      weakEtag: null,
    });
  });
});
