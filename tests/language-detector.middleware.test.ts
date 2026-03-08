import { describe, expect, test } from "bun:test";
import { LanguageDetectorMiddleware } from "../src/language-detector.middleware";
import { LanguageDetectorCookieStrategy } from "../src/language-detector-cookie.strategy";
import { LanguageDetectorHeaderStrategy } from "../src/language-detector-header.strategy";
import { LanguageDetectorQueryStrategy } from "../src/language-detector-query.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const query = new LanguageDetectorQueryStrategy("lang");
const cookie = new LanguageDetectorCookieStrategy("language");
const header = new LanguageDetectorHeaderStrategy();

describe("LanguageDetectorMiddleware", () => {
  test("fallback - no strategies", () => {
    const middleware = new LanguageDetectorMiddleware({ languages: mocks.languages, strategies: [] });
    const context = new RequestContextBuilder().build();

    expect(middleware.evaluate(context)).toEqual(mocks.languages.fallback);
  });

  test("fallback - no result", () => {
    const middleware = new LanguageDetectorMiddleware({
      languages: mocks.languages,
      strategies: [query, cookie, header],
    });
    const context = new RequestContextBuilder().build();

    expect(middleware.evaluate(context)).toEqual(mocks.languages.fallback);
  });

  test("happy path - query", () => {
    const middleware = new LanguageDetectorMiddleware({ languages: mocks.languages, strategies: [query] });
    const context = new RequestContextBuilder().withQuery({ lang: mocks.languages.supported.pl }).build();

    expect(middleware.evaluate(context)).toEqual(mocks.languages.supported.pl);
  });

  test("happy path - cookie", () => {
    const middleware = new LanguageDetectorMiddleware({ languages: mocks.languages, strategies: [cookie] });
    const context = new RequestContextBuilder().withCookie("language", mocks.languages.supported.pl).build();

    expect(middleware.evaluate(context)).toEqual(mocks.languages.supported.pl);
  });

  test("happy path - header", () => {
    const middleware = new LanguageDetectorMiddleware({ languages: mocks.languages, strategies: [header] });
    const context = new RequestContextBuilder().withHeader("Accept-Language", "pl-PL").build();

    expect(middleware.evaluate(context)).toEqual(mocks.languages.supported.pl);
  });

  test("cascade - first", () => {
    const middleware = new LanguageDetectorMiddleware({
      languages: mocks.languages,
      strategies: [query, cookie, header],
    });
    const context = new RequestContextBuilder()
      .withQuery({ lang: mocks.languages.supported.en })
      .withCookie("language", mocks.languages.supported.pl)
      .withHeader("Accept-Language", mocks.languages.supported.pl)
      .build();

    expect(middleware.evaluate(context)).toEqual(mocks.languages.supported.en);
  });

  test("cascade - second", () => {
    const middleware = new LanguageDetectorMiddleware({
      languages: mocks.languages,
      strategies: [query, cookie, header],
    });
    const context = new RequestContextBuilder()
      .withCookie("language", mocks.languages.supported.pl)
      .withHeader("Accept-Language", mocks.languages.supported.pl)
      .build();

    expect(middleware.evaluate(context)).toEqual(mocks.languages.supported.pl);
  });

  test("cascade - third", () => {
    const middleware = new LanguageDetectorMiddleware({
      languages: mocks.languages,
      strategies: [query, cookie, header],
    });
    const context = new RequestContextBuilder()
      .withHeader("Accept-Language", mocks.languages.supported.pl)
      .build();

    expect(middleware.evaluate(context)).toEqual(mocks.languages.supported.pl);
  });

  test("cascade - fallback", () => {
    const middleware = new LanguageDetectorMiddleware({
      languages: mocks.languages,
      strategies: [query, cookie, header],
    });
    const context = new RequestContextBuilder().build();

    expect(middleware.evaluate(context)).toEqual(mocks.languages.supported.en);
  });
});
