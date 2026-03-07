import { describe, expect, test } from "bun:test";
import { I18nConfig } from "../src/i18n-config.vo";
import { LanguageDetectorQueryStrategy } from "../src/language-detector-query.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const SupportedLanguages = ["en", "pl"] as const;
const i18n = new I18nConfig(SupportedLanguages, "en");

const query = "language";
const strategy = new LanguageDetectorQueryStrategy(query);

describe("LanguageDetectorQueryStrategy", () => {
  test("happy path", () => {
    const en = new RequestContextBuilder().withQuery({ [query]: i18n.supported.en }).build();
    const pl = new RequestContextBuilder().withQuery({ [query]: i18n.supported.pl }).build();

    expect(strategy.detect(en, i18n)).toEqual(i18n.supported.en);

    expect(strategy.detect(pl, i18n)).toEqual(i18n.supported.pl);
  });

  test("missing", () => {
    const context = new RequestContextBuilder().build();

    expect(strategy.detect(context, i18n)).toEqual(null);
  });

  test("unsupported", () => {
    const context = new RequestContextBuilder().withQuery({ [query]: "es" }).build();

    expect(strategy.detect(context, i18n)).toEqual(null);
  });
});
