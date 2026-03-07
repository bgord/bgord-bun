import { describe, expect, test } from "bun:test";
import { LanguageDetectorHeaderStrategy } from "../src/language-detector-header.strategy";
import { Languages } from "../src/languages.vo";
import { RequestContextBuilder } from "./request-context-builder";

const SupportedLanguages = ["en", "pl"] as const;
const i18n = new Languages(SupportedLanguages, "en");

const header = "Accept-Language";
const strategy = new LanguageDetectorHeaderStrategy();

describe("LanguageDetectorHeaderStrategy", () => {
  test("happy path", () => {
    const en = new RequestContextBuilder().withHeader(header, "en").build();
    const pl = new RequestContextBuilder().withHeader(header, "pl").build();

    expect(strategy.detect(en, i18n)).toEqual(i18n.supported.en);

    expect(strategy.detect(pl, i18n)).toEqual(i18n.supported.pl);
  });

  test("happy path - language with region", () => {
    const enUS = new RequestContextBuilder().withHeader("Accept-Language", "en-US").build();
    const plPL = new RequestContextBuilder().withHeader("Accept-Language", "pl-PL").build();

    expect(strategy.detect(enUS, i18n)).toEqual(i18n.supported.en);
    expect(strategy.detect(plPL, i18n)).toEqual(i18n.supported.pl);
  });

  test("happy path - multiple languages with quality values", () => {
    const context = new RequestContextBuilder()
      .withHeader("Accept-Language", "en-US,en;q=0.9,pl;q=0.8")
      .build();

    expect(strategy.detect(context, i18n)).toEqual(i18n.supported.en);
  });

  test("happy path - first supported language", () => {
    const context = new RequestContextBuilder().withHeader("Accept-Language", "de,pl,en").build();

    expect(strategy.detect(context, i18n)).toEqual(i18n.supported.pl);
  });

  test("missing", () => {
    const context = new RequestContextBuilder().build();

    expect(strategy.detect(context, i18n)).toEqual(null);
  });

  test("unsupported", () => {
    const context = new RequestContextBuilder().withHeader(header, "es").build();

    expect(strategy.detect(context, i18n)).toEqual(null);
  });
});
