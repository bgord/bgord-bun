import { describe, expect, jest, spyOn, test } from "bun:test";
import { Hono } from "hono";

import { EtagVariables } from "../src/etag-extractor";
import { I18nConfigType } from "../src/i18n";
import { Logger } from "../src/logger";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { Setup } from "../src/setup";
import { TimeZoneOffsetVariables } from "../src/time-zone-offset";
import * as testcases from "./testcases";

describe("Setup", () => {
  test("sets the essentials", async () => {
    const predefinedRequestId = "123";

    const logger = new Logger({
      app: "bgord-bun-api",
      environment: NodeEnvironmentEnum.local,
    });

    const loggerHttp = spyOn(logger, "http").mockImplementation(jest.fn());

    const i18n: I18nConfigType = {
      supportedLanguages: { pl: "pl", en: "en" },
      defaultLanguage: "en",
    };

    const app = new Hono<{
      Variables: TimeZoneOffsetVariables & EtagVariables;
    }>();

    app.use(...Setup.essentials(logger, i18n));

    app.get("/ping", (c) =>
      c.json({
        requestId: c.get("requestId"),
        timeZoneOffset: c.get("timeZoneOffset"),
        language: c.get("language"),
        etag: c.get("ETag"),
        weakEtag: c.get("WeakETag"),
      }),
    );

    const response = await app.request(
      "/ping",
      {
        method: "GET",
        headers: new Headers({ "x-request-id": predefinedRequestId }),
      },
      testcases.ip,
    );

    expect(response.headers.toJSON()).toMatchObject({
      "access-control-allow-origin": "*",
      "api-version": expect.any(String),
      "content-type": "application/json",
      "cross-origin-opener-policy": "same-origin",
      "cross-origin-resource-policy": "same-origin",
      "origin-agent-cluster": "?1",
      "referrer-policy": "no-referrer",
      "server-timing": expect.any(String),
      "strict-transport-security": "max-age=15552000; includeSubDomains",
      "x-content-type-options": "nosniff",
      "x-dns-prefetch-control": "off",
      "x-download-options": "noopen",
      "x-frame-options": "SAMEORIGIN",
      "x-permitted-cross-domain-policies": "none",
      "x-request-id": expect.any(String),
      "x-xss-protection": "0",
    });

    const json = await response.json();
    expect(json).toEqual({
      requestId: predefinedRequestId,
      timeZoneOffset: { miliseconds: 0, minutes: 0, seconds: 0 },
      language: "en",
      etag: null,
      weakEtag: null,
    });

    loggerHttp.mockRestore();
  });
});
