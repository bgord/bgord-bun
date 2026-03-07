import { describe, expect, test } from "bun:test";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { I18nConfig } from "../src/i18n-config.vo";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { TranslationsHandler } from "../src/translations.handler";

const SupportedLanguages = ["pl", "en"] as const;

const i18n = new I18nConfig(SupportedLanguages, "en");

const Logger = new LoggerNoopAdapter();
const FileReaderJson = new FileReaderJsonNoopAdapter({ hello: "Hello" });
const deps = { FileReaderJson, Logger };

const handler = new TranslationsHandler(i18n, deps);

describe("TranslationsHandler", () => {
  test("happy path - no language specified", async () => {
    expect(await handler.execute("en")).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: i18n.supported,
    });
  });

  test("happy path - en", async () => {
    expect(await handler.execute(i18n.supported.en)).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: i18n.supported,
    });
  });

  test("happy path - pl", async () => {
    expect(await handler.execute(i18n.supported.pl)).toEqual({
      translations: { hello: "Hello" },
      language: "pl",
      supportedLanguages: i18n.supported,
    });
  });

  test("happy path - other", async () => {
    expect(await handler.execute("es")).toEqual({
      translations: { hello: "Hello" },
      language: "es",
      supportedLanguages: i18n.supported,
    });
  });
});
