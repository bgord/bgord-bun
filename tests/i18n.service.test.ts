import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { languageDetector } from "hono/language";
import { FileReaderJsonForgivingAdapter } from "../src/file-reader-json-forgiving.adapter";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { I18n } from "../src/i18n.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

enum SupportedLanguages {
  en = "en",
  pl = "pl",
}

const Logger = new LoggerNoopAdapter();
const FileReaderJson = new FileReaderJsonNoopAdapter({ hello: "Hello" });
const deps = { Logger, FileReaderJson };
const i18n = new I18n(deps);

const translations = { greeting: "Hello", welcome: "Welcome, {{name}}!" };

const t = i18n.useTranslations(translations);

const app = new Hono()
  .use(
    languageDetector({
      supportedLanguages: [SupportedLanguages.en, SupportedLanguages.pl],
      fallbackLanguage: SupportedLanguages.en,
    }),
  )
  .get("/", (c) => c.json({ language: c.get("language") }));

describe("I18n service", () => {
  test("middleware - happy path", async () => {
    const response = await app.request("/", { headers: { cookie: "language=pl" } });
    const json = await response.json();

    expect(json.language).toEqual("pl");
  });

  test("middleware - missing cookie", async () => {
    const response = await app.request("/");
    const json = await response.json();

    expect(json.language).toEqual("en");
  });

  test("middleware - unsupported language", async () => {
    const response = await app.request("/", { headers: { cookie: "language=fr" } });
    const json = await response.json();

    expect(json.language).toEqual("en");
  });

  test("getTranslationPathForLanguage", () => {
    expect(i18n.getTranslationPathForLanguage("en").get()).toEqual("infra/translations/en.json");
  });

  test("getTranslationPathForLanguage - custom path", () => {
    expect(
      new I18n(deps, tools.DirectoryPathRelativeSchema.parse("custom/path"))
        .getTranslationPathForLanguage("pl")
        .get(),
    ).toEqual("custom/path/pl.json");
  });

  test("useTranslations", () => {
    expect(t("greeting")).toEqual("Hello");
  });

  test("useTranslations - placeholder", () => {
    expect(t("welcome", { name: "John" })).toEqual("Welcome, John!");
  });

  test("useTranslations - passthrough", () => {
    using loggerWarn = spyOn(Logger, "warn");
    const key = "nonexistent";

    expect(t(key)).toEqual(key);
    expect(loggerWarn).toHaveBeenCalledWith({
      message: `Missing translation for key ${key}`,
      component: "infra",
      operation: "translations",
    });
  });

  test("getTranslations", async () => {
    expect(await i18n.getTranslations("en")).toEqual({ hello: "Hello" });
  });

  test("getTranslations - error", async () => {
    using _ = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    const i18n = new I18n({ FileReaderJson: new FileReaderJsonForgivingAdapter(), Logger });

    expect(await i18n.getTranslations("en")).toEqual({});
  });
});
