import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { languageDetector } from "hono/language";
import { JsonFileReaderNoopAdapter } from "../src/file-reader-json-noop.adpater";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { Translations } from "../src/translations.service";

enum SupportedLanguages {
  en = "en",
  pl = "pl",
}

const Logger = new LoggerNoopAdapter();
const JsonFileReader = new JsonFileReaderNoopAdapter({ hello: "Hello" });

const deps = { JsonFileReader, Logger };

const app = new Hono()
  .use(
    languageDetector({
      supportedLanguages: Object.keys(SupportedLanguages),
      fallbackLanguage: SupportedLanguages.en,
    }),
  )
  .get("/get-translations", ...Translations.build(deps));

describe("Translations service", () => {
  test("happy path - no language specified", async () => {
    const response = await app.request("/get-translations", { method: "GET" });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({ translations: { hello: "Hello" }, language: "en" });
  });

  test("happy path - en", async () => {
    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: `language=${SupportedLanguages.en}` },
    });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({ translations: { hello: "Hello" }, language: "en" });
  });

  test("happy path - pl", async () => {
    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: `language=${SupportedLanguages.pl}` },
    });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({ translations: { hello: "Hello" }, language: "pl" });
  });

  test("happy path - other", async () => {
    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: "language=fr" },
    });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({ translations: { hello: "Hello" }, language: "en" });
  });
});
