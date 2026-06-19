import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { LanguageDetectorCookieStrategy } from "../src/language-detector-cookie.strategy";
import { LanguageDetectorHonoMiddleware } from "../src/language-detector-hono.middleware";
import { Languages } from "../src/languages.vo";
import { TranslationsHonoHandler } from "../src/translations-hono.handler";
import { TranslationsProviderNoopAdapter } from "../src/translations-provider-noop.adapter";

const SupportedLanguages = ["pl", "en"] as const;
const languages = new Languages(SupportedLanguages, "en");

const TranslationsProvider = new TranslationsProviderNoopAdapter(SupportedLanguages, {
  en: { hello: "Hello" },
  pl: { hello: "Hello" },
});

const cookie = new LanguageDetectorCookieStrategy("language");
const app = new Hono()
  .use(new LanguageDetectorHonoMiddleware({ languages, strategies: [cookie] }).handle())
  .get("/get-translations", ...new TranslationsHonoHandler(languages, { TranslationsProvider }).handle());

describe("TranslationsHonoHandler", () => {
  test("happy path - no language specified", async () => {
    const response = await app.request("/get-translations", { method: "GET" });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: languages.supported,
    });
  });

  test("happy path - en", async () => {
    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: `language=${languages.supported.en}` },
    });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: languages.supported,
    });
  });

  test("happy path - pl", async () => {
    const response = await app.request("/get-translations", {
      method: "GET",
      headers: { cookie: `language=${languages.supported.pl}` },
    });
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json).toEqual({
      translations: { hello: "Hello" },
      language: "pl",
      supportedLanguages: languages.supported,
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
      supportedLanguages: languages.supported,
    });
  });
});
