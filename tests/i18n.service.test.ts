import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { languageDetector } from "hono/language";
import { I18n } from "../src/i18n.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const logger = new LoggerNoopAdapter();

describe("I18n middleware", () => {
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

describe("I18n.getTranslationPathForLanguage", () => {
  test("returns the correct path for language", () => {
    expect(new I18n().getTranslationPathForLanguage("en").get()).toEqual("infra/translations/en.json");
  });

  test("uses custom translation path if provided", () => {
    expect(
      new I18n(tools.DirectoryPathRelativeSchema.parse("custom/path"))
        .getTranslationPathForLanguage("pl")
        .get(),
    ).toEqual("custom/path/pl.json");
  });
});

describe("I18n.useTranslations", () => {
  const translations = { greeting: "Hello", welcome: "Welcome, {{name}}!" };
  const t = new I18n().useTranslations(logger, translations);

  test("returns the correct translation", () => {
    expect(t("greeting")).toEqual("Hello");
  });

  test("replaces placeholders with variables", () => {
    expect(t("welcome", { name: "John" })).toEqual("Welcome, John!");
  });

  test("returns key if translation is missing", () => {
    const loggerWarnSpy = spyOn(logger, "warn").mockImplementation(jest.fn());

    expect(t("nonexistent")).toEqual("nonexistent");
    expect(loggerWarnSpy).toHaveBeenCalled();
  });
});

describe("I18n.getTranslations", () => {
  test("reads and parses translation file", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockReturnValue({ json: async () => ({ hello: "Hello" }) });

    expect(await new I18n().getTranslations("en")).toEqual({ hello: "Hello" });
    expect(Bun.file).toHaveBeenCalledWith(expect.stringContaining("en.json"));
  });

  test("returns empty object on error", async () => {
    spyOn(Bun, "file").mockImplementationOnce(() => {
      throw new Error(mocks.IntentialError);
    });

    expect(await new I18n().getTranslations("en")).toEqual({});
  });
});
