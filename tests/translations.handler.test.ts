import { describe, expect, test } from "bun:test";
import { Languages } from "../src/languages.vo";
import { TranslationsHandler } from "../src/translations.handler";
import { TranslationsProviderNoopAdapter } from "../src/translations-provider-noop.adapter";

const SupportedLanguages = ["pl", "en"] as const;
const languages = new Languages(SupportedLanguages, "en");

const TranslationsProvider = new TranslationsProviderNoopAdapter({
  en: { hello: "Hello" },
  pl: { hello: "Hello" },
});

const handler = new TranslationsHandler(languages, { TranslationsProvider });

describe("TranslationsHandler", () => {
  test("happy path - no language specified", async () => {
    expect(await handler.execute("en")).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: languages.supported,
    });
  });

  test("happy path - en", async () => {
    expect(await handler.execute(languages.supported.en)).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: languages.supported,
    });
  });

  test("happy path - pl", async () => {
    expect(await handler.execute(languages.supported.pl)).toEqual({
      translations: { hello: "Hello" },
      language: "pl",
      supportedLanguages: languages.supported,
    });
  });

  test("happy path - other", async () => {
    expect(await handler.execute("es")).toEqual({
      translations: {},
      language: "es",
      supportedLanguages: languages.supported,
    });
  });
});
