import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { languageDetector } from "hono/language";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { I18nConfig } from "../src/i18n-config.vo";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { TranslationsHonoHandler } from "../src/translations-hono.handler";

enum SupportedLanguages {
  en = "en",
  pl = "pl",
}

const i18n = new I18nConfig(SupportedLanguages, SupportedLanguages.en);

const Logger = new LoggerNoopAdapter();
const FileReaderJson = new FileReaderJsonNoopAdapter({ hello: "Hello" });
const deps = { FileReaderJson, Logger };

const app = new Hono()
  .use(
    languageDetector({
      supportedLanguages: Object.keys(SupportedLanguages),
      fallbackLanguage: SupportedLanguages.en,
    }),
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
      supportedLanguages: SupportedLanguages,
    });
  });

  test("happy path - en", async () => {
    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: `language=${SupportedLanguages.en}` },
    });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: SupportedLanguages,
    });
  });

  test("happy path - pl", async () => {
    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: `language=${SupportedLanguages.pl}` },
    });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({
      translations: { hello: "Hello" },
      language: "pl",
      supportedLanguages: SupportedLanguages,
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
      supportedLanguages: SupportedLanguages,
    });
  });
});
