import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import type { EtagVariables } from "../src/etag-extractor.middleware";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import type { I18nConfigType } from "../src/i18n.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { Setup } from "../src/setup.service";
import type { TimeZoneOffsetVariables } from "../src/time-zone-offset.middleware";
import * as mocks from "./mocks";

const ip = { server: { requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }) } };
const predefinedRequestId = "123";
const I18n: I18nConfigType = { supportedLanguages: { pl: "pl", en: "en" }, defaultLanguage: "pl" };

const version = "1.2.3";
const FileReaderJson = new FileReaderJsonNoopAdapter({ version });
const Logger = new LoggerNoopAdapter();
const IdProvider = new IdProviderDeterministicAdapter([
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
  mocks.correlationId,
]);
const Clock = new ClockSystemAdapter();
const deps = { Logger, I18n, IdProvider, Clock, FileReaderJson };

describe("Setup service", () => {
  test("happy path", async () => {
    const app = new Hono<{ Variables: TimeZoneOffsetVariables & EtagVariables }>()
      .use(...Setup.essentials(deps))
      .get("/ping", (c) =>
        c.json({
          requestId: c.get("requestId"),
          timeZoneOffset: c.get("timeZoneOffset"),
          language: c.get("language"),
          etag: c.get("ETag"),
          weakEtag: c.get("WeakETag"),
        }),
      );

    const response = await app.request("/ping", { method: "GET" }, ip);
    const json = await response.json();

    expect(response.headers.toJSON()).toEqual({
      "access-control-allow-origin": "*",
      "content-type": "application/json",
      "server-timing": expect.any(String),
      "cross-origin-opener-policy": "same-origin",
      "cross-origin-resource-policy": "cross-origin",
      "referrer-policy": "no-referrer",
      "strict-transport-security": "max-age=15552000; includeSubDomains",
      "x-content-type-options": "nosniff",
      "x-dns-prefetch-control": "off",
      "x-frame-options": "SAMEORIGIN",
      "x-xss-protection": "0",
      "api-version": version,
      "x-correlation-id": mocks.correlationId,
      "origin-agent-cluster": "?1",
      "x-download-options": "noopen",
      "x-permitted-cross-domain-policies": "none",
    });
    expect(json).toEqual({
      requestId: mocks.correlationId,
      timeZoneOffset: { internal: 0 },
      language: I18n.defaultLanguage,
      etag: null,
      weakEtag: null,
    });
  });

  test("x-correlation-id forwarding", async () => {
    const app = new Hono<{ Variables: TimeZoneOffsetVariables & EtagVariables }>()
      .use(...Setup.essentials(deps))
      .get("/ping", (c) => c.json({ requestId: c.get("requestId") }));

    const response = await app.request(
      "/ping",
      { method: "GET", headers: new Headers({ "x-correlation-id": predefinedRequestId }) },
      ip,
    );
    const json = await response.json();

    expect(response.headers.toJSON()).toEqual(
      expect.objectContaining({ "x-correlation-id": predefinedRequestId }),
    );
    expect(json).toEqual({ requestId: predefinedRequestId });
  });

  test("maintenance mode", async () => {
    const app = new Hono<{ Variables: TimeZoneOffsetVariables & EtagVariables }>()
      .use(...Setup.essentials(deps, { maintenanceMode: { enabled: true } }))
      .get("/ping", (c) => c.text("OK"));

    const response = await app.request(
      "/ping",
      { method: "GET", headers: new Headers({ "x-correlation-id": predefinedRequestId }) },
      ip,
    );
    const json = await response.json();

    expect(response.headers.toJSON()).toEqual({
      "content-type": "application/json",
      "retry-after": tools.Duration.Hours(1).seconds.toString(),
    });
    expect(json).toEqual({ reason: "maintenance" });
  });

  test("bodyLimit", async () => {
    spyOn(process.stderr, "write").mockImplementation(jest.fn());
    const boundary = "----bun-test-boundary";
    const content = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="too-big.txt"',
      "Content-Type: text/plain",
      "",
      "this content is larger than 10 bytes",
      `--${boundary}--`,
      "",
    ].join("\r\n");
    const headers = { "Content-Type": `multipart/form-data; boundary=${boundary}` };

    const app = new Hono<{ Variables: TimeZoneOffsetVariables & EtagVariables }>({})
      .use(...Setup.essentials(deps, { BODY_LIMIT_MAX_SIZE: tools.Size.fromBytes(2) }))
      .post("/upload", async (c) => {
        await c.req.parseBody();

        return c.text("OK");
      });

    const response = await app.request(
      "/upload",
      { method: "POST", body: new TextEncoder().encode(content), headers },
      ip,
    );

    expect(response.status).toEqual(413);
  });

  test("languageDetector - supportedLanguages", async () => {
    const app = new Hono().use(...Setup.essentials(deps)).get("/lang", (c) => c.text(c.get("language")));

    const response = await app.request("/lang", { headers: { "Accept-Language": "de-DE,de;q=0.9" } }, ip);

    expect(await response.text()).toEqual(I18n.defaultLanguage as string);
  });

  test("overrides - cors", async () => {
    const origin = "https://some.example";
    const app = new Hono()
      .use(...Setup.essentials(deps, { cors: { origin } }))
      .get("/cors", (c) => c.text("ok"));

    const response = await app.request("/cors", { headers: { Origin: "https://some.example" } }, ip);

    expect(response.status).toEqual(200);
    expect(response.headers.get("access-control-allow-origin")).toEqual(origin);
  });
});
