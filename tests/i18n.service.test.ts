import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { FileReaderJsonForgivingAdapter } from "../src/file-reader-json-forgiving.adapter";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { I18n } from "../src/i18n.service";
import { LanguageDetectorCookieStrategy } from "../src/language-detector-cookie.strategy";
import {
  LanguageDetectorHonoMiddleware,
  type LanguageDetectorVariables,
} from "../src/language-detector-hono.middleware";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

type Config = { Variables: LanguageDetectorVariables };

const cookie = new LanguageDetectorCookieStrategy("language");

const Logger = new LoggerNoopAdapter();
const FileReaderJson = new FileReaderJsonNoopAdapter({ hello: "Hello" });
const deps = { Logger, FileReaderJson };
const i18n = new I18n(deps);

const translations = { greeting: "Hello", welcome: "Welcome, {{name}}!" };

const t = i18n.useTranslations(translations);

const app = new Hono<Config>()
  .use(new LanguageDetectorHonoMiddleware({ languages: mocks.languages, strategies: [cookie] }).handle())
  .get("/", (c) => c.json({ language: c.get("language") }));

describe("I18n", () => {
  test("middleware - happy path", async () => {
    const response = await app.request("/", {
      headers: { cookie: `language=${mocks.languages.supported.pl}` },
    });
    const json = await response.json();

    expect(json.language).toEqual(mocks.languages.supported.pl);
  });

  test("middleware - missing cookie", async () => {
    const response = await app.request("/");
    const json = await response.json();

    expect(json.language).toEqual(mocks.languages.supported.en);
  });

  test("middleware - unsupported language", async () => {
    const response = await app.request("/", { headers: { cookie: "language=fr" } });
    const json = await response.json();

    expect(json.language).toEqual(mocks.languages.supported.en);
  });

  test("getTranslationPathForLanguage", () => {
    expect(i18n.getTranslationPathForLanguage(mocks.languages.supported.en).get()).toEqual(
      `infra/translations/${mocks.languages.supported.en}.json`,
    );
  });

  test("getTranslationPathForLanguage - custom path", () => {
    expect(
      new I18n(deps, tools.DirectoryPathRelativeSchema.parse("custom/path"))
        .getTranslationPathForLanguage(mocks.languages.supported.pl)
        .get(),
    ).toEqual(`custom/path/${mocks.languages.supported.pl}.json`);
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
      message: "Missing translation key",
      component: "infra",
      operation: "translations",
      metadata: { key },
    });
  });

  test("getTranslations", async () => {
    expect(await i18n.getTranslations(mocks.languages.supported.en)).toEqual({ hello: "Hello" });
  });

  test("getTranslations - error", async () => {
    using _ = spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);

    const i18n = new I18n({ FileReaderJson: new FileReaderJsonForgivingAdapter(), Logger });

    expect(await i18n.getTranslations(mocks.languages.supported.en)).toEqual({});
  });
});
