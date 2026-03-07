import { describe, expect, test } from "bun:test";
import { I18nConfig } from "../src/i18n-config.vo";
import { LanguageDetectorMiddleware } from "../src/language-detector.middleware";
import { LanguageDetectorCookieStrategy } from "../src/language-detector-cookie.strategy";
import { LanguageDetectorHeaderStrategy } from "../src/language-detector-header.strategy";
import { LanguageDetectorQueryStrategy } from "../src/language-detector-query.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const SupportedLanguages = ["en", "pl"] as const;
const i18n = new I18nConfig(SupportedLanguages, "en");

const query = new LanguageDetectorQueryStrategy("lang");
const cookie = new LanguageDetectorCookieStrategy("language");
const header = new LanguageDetectorHeaderStrategy();

describe("LanguageDetectorMiddleware", () => {
  test("fallback - no strategies", () => {
    const middleware = new LanguageDetectorMiddleware({ i18n, strategies: [] });
    const context = new RequestContextBuilder().build();

    expect(middleware.evaluate(context)).toEqual(i18n.fallback);
  });

  test("fallback - no result", () => {
    const middleware = new LanguageDetectorMiddleware({ i18n, strategies: [query, cookie, header] });
    const context = new RequestContextBuilder().build();

    expect(middleware.evaluate(context)).toEqual(i18n.fallback);
  });

  test("happy path - query", () => {
    const middleware = new LanguageDetectorMiddleware({ i18n, strategies: [query] });
    const context = new RequestContextBuilder().withQuery({ lang: i18n.supported.pl }).build();

    expect(middleware.evaluate(context)).toEqual(i18n.supported.pl);
  });

  test("happy path - cookie", () => {
    const middleware = new LanguageDetectorMiddleware({ i18n, strategies: [cookie] });
    const context = new RequestContextBuilder().withCookie("language", i18n.supported.pl).build();

    expect(middleware.evaluate(context)).toEqual(i18n.supported.pl);
  });

  test("happy path - header", () => {
    const middleware = new LanguageDetectorMiddleware({ i18n, strategies: [header] });
    const context = new RequestContextBuilder().withHeader("Accept-Language", "pl-PL").build();

    expect(middleware.evaluate(context)).toEqual(i18n.supported.pl);
  });

  test("cascade - first", () => {
    const middleware = new LanguageDetectorMiddleware({ i18n, strategies: [query, cookie, header] });
    const context = new RequestContextBuilder()
      .withQuery({ lang: i18n.supported.en })
      .withCookie("language", i18n.supported.pl)
      .withHeader("Accept-Language", i18n.supported.pl)
      .build();

    expect(middleware.evaluate(context)).toEqual(i18n.supported.en);
  });

  test("cascade - second", () => {
    const middleware = new LanguageDetectorMiddleware({ i18n, strategies: [query, cookie, header] });
    const context = new RequestContextBuilder()
      .withCookie("language", i18n.supported.pl)
      .withHeader("Accept-Language", i18n.supported.pl)
      .build();

    expect(middleware.evaluate(context)).toEqual(i18n.supported.pl);
  });

  test("cascade - third", () => {
    const middleware = new LanguageDetectorMiddleware({ i18n, strategies: [query, cookie, header] });
    const context = new RequestContextBuilder().withHeader("Accept-Language", i18n.supported.pl).build();

    expect(middleware.evaluate(context)).toEqual(i18n.supported.pl);
  });

  test("cascade - fallback", () => {
    const middleware = new LanguageDetectorMiddleware({ i18n, strategies: [query, cookie, header] });
    const context = new RequestContextBuilder().build();

    expect(middleware.evaluate(context)).toEqual(i18n.supported.en);
  });
});
