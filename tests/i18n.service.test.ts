import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { languageDetector } from "hono/language";
import { I18n } from "../src/i18n.service";
import { JsonFileReaderBunForgivingAdapter } from "../src/json-file-reader-bun-forgiving.adapter";
import { JsonFileReaderNoopAdapter } from "../src/json-file-reader-noop.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const JsonFileReader = new JsonFileReaderNoopAdapter({ hello: "Hello" });

const deps = { Logger, JsonFileReader };

enum SupportedLanguages {
  en = "en",
  pl = "pl",
}

const i18n = new I18n(deps);

const app = new Hono()
  .use(
    languageDetector({
      supportedLanguages: [SupportedLanguages.en, SupportedLanguages.pl],
      fallbackLanguage: SupportedLanguages.en,
    }),
  )
  .get("/", (c) => c.json({ language: c.get("language") }));

describe("I18n", () => {
  describe("middleware", () => {
    test("sets fallback language when cookie is missing", async () => {
      const response = await app.request("/");
      const json = await response.json();

      expect(json.language).toEqual("en");
    });

    test("uses language from supported cookie", async () => {
      const response = await app.request("/", { headers: { cookie: "language=pl" } });
      const json = await response.json();

      expect(json.language).toEqual("pl");
    });

    test("falls back to default for unsupported language cookie", async () => {
      const response = await app.request("/", { headers: { cookie: "language=fr" } });
      const json = await response.json();

      expect(json.language).toEqual("en");
    });
  });

  describe("getTranslationPathForLanguage", () => {
    test("returns the correct path for language", () => {
      expect(i18n.getTranslationPathForLanguage("en").get()).toEqual("infra/translations/en.json");
    });

    test("uses custom translation path if provided", () => {
      expect(
        new I18n(deps, tools.DirectoryPathRelativeSchema.parse("custom/path"))
          .getTranslationPathForLanguage("pl")
          .get(),
      ).toEqual("custom/path/pl.json");
    });
  });

  describe("useTranslations", () => {
    const translations = { greeting: "Hello", welcome: "Welcome, {{name}}!" };
    const t = i18n.useTranslations(translations);

    test("returns the correct translation", () => {
      expect(t("greeting")).toEqual("Hello");
    });

    test("replaces placeholders with variables", () => {
      expect(t("welcome", { name: "John" })).toEqual("Welcome, John!");
    });

    test("returns key if translation is missing", () => {
      const loggerWarnSpy = spyOn(Logger, "warn").mockImplementation(jest.fn());

      expect(t("nonexistent")).toEqual("nonexistent");
      expect(loggerWarnSpy).toHaveBeenCalled();
    });
  });

  describe("getTranslations", () => {
    test("reads and parses translation file", async () => {
      expect(await i18n.getTranslations("en")).toEqual({ hello: "Hello" });
    });

    test("returns empty object on error", async () => {
      spyOn(Bun, "file").mockImplementation(() => {
        throw new Error(mocks.IntentialError);
      });

      const i18n = new I18n({ JsonFileReader: new JsonFileReaderBunForgivingAdapter(), Logger });

      expect(await i18n.getTranslations("en")).toEqual({});
    });
  });
});
