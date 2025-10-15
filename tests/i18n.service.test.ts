import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { languageDetector } from "hono/language";
import { JsonFileReaderNoopAdapter } from "../src/file-reader-json-noop.adpater";
import { I18n } from "../src/i18n.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const JsonFileReader = new JsonFileReaderNoopAdapter({ hello: "Hello" });

const deps = { Logger, JsonFileReader };

const i18n = new I18n(deps);

describe("I18n", () => {
  describe("middleware", () => {
    const supportedLanguages = { en: "en", pl: "pl" };

    test("sets fallback language when cookie is missing", async () => {
      const app = new Hono()
        .use(
          languageDetector({
            supportedLanguages: [supportedLanguages.en, supportedLanguages.pl],
            fallbackLanguage: supportedLanguages.en,
          }),
        )
        .get("/", (c) => c.json({ language: c.get("language") }));

      const response = await app.request("/");
      const json = await response.json();

      expect(json.language).toEqual("en");
    });

    test("uses language from supported cookie", async () => {
      const app = new Hono()
        .use(
          languageDetector({
            supportedLanguages: [supportedLanguages.en, supportedLanguages.pl],
            fallbackLanguage: supportedLanguages.en,
          }),
        )
        .get("/", (c) => c.text(c.get("language")));

      const response = await app.request("/", {
        headers: { cookie: "language=pl" },
      });

      expect(await response.text()).toEqual("pl");
    });

    test("falls back to default for unsupported language cookie", async () => {
      const app = new Hono()
        .use(
          languageDetector({
            supportedLanguages: [supportedLanguages.en, supportedLanguages.pl],
            fallbackLanguage: supportedLanguages.en,
          }),
        )
        .get("/", (c) => c.text(c.get("language")));

      const response = await app.request("/", {
        headers: { cookie: "language=fr" },
      });

      expect(await response.text()).toEqual("en");
    });

    test("uses custom defaultLanguage if provided", async () => {
      const app = new Hono()
        .use(
          languageDetector({
            supportedLanguages: [supportedLanguages.en, supportedLanguages.pl],
            fallbackLanguage: supportedLanguages.pl,
          }),
        )
        .get("/", (c) => c.text(c.get("language")));

      const response = await app.request("/");

      expect(await response.text()).toEqual("pl");
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
      spyOn(JsonFileReader, "read").mockImplementation(() => {
        throw new Error(mocks.IntentialError);
      });

      expect(await i18n.getTranslations("en")).toEqual({});
    });
  });
});
