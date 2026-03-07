import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { I18nConfig } from "../src/i18n-config.vo";
import { LanguageDetectorCookieStrategy } from "../src/language-detector-cookie.strategy";
import { LanguageDetectorHonoMiddleware } from "../src/language-detector-hono.middleware";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { TranslationsHonoHandler } from "../src/translations-hono.handler";

const SupportedLanguages = ["pl", "en"] as const;
const i18n = new I18nConfig(SupportedLanguages, "en");

const Logger = new LoggerNoopAdapter();
const FileReaderJson = new FileReaderJsonNoopAdapter({ hello: "Hello" });
const deps = { FileReaderJson, Logger };

const app = new Hono()
  .use(
    new LanguageDetectorHonoMiddleware({
      i18n,
      strategies: [new LanguageDetectorCookieStrategy("language")],
    }).handle(),
  )
  .get("/get-translations", ...new TranslationsHonoHandler(i18n, deps).handle());

describe("TranslationsHonoHandler", () => {
  test("happy path - no language specified", async () => {
    const response = await app.request("/get-translations", { method: "GET" });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: i18n.supported,
    });
  });

  test("happy path - en", async () => {
    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: `language=${i18n.supported.en}` },
    });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: i18n.supported,
    });
  });

  test("happy path - pl", async () => {
    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: `language=${i18n.supported.pl}` },
    });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({
      translations: { hello: "Hello" },
      language: "pl",
      supportedLanguages: i18n.supported,
    });
  });

  test("happy path - other", async () => {
    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: "language=fr" },
    });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: i18n.supported,
    });
  });
});
