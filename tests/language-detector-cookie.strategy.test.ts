import { describe, expect, test } from "bun:test";
import { LanguageDetectorCookieStrategy } from "../src/language-detector-cookie.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const cookie = "language";
const strategy = new LanguageDetectorCookieStrategy(cookie);

describe("LanguageDetectorCookieStrategy", () => {
  test("happy path", () => {
    const en = new RequestContextBuilder().withCookie(cookie, mocks.languages.supported.en).build();
    const pl = new RequestContextBuilder().withCookie(cookie, mocks.languages.supported.pl).build();

    expect(strategy.detect(en, mocks.languages)).toEqual(mocks.languages.supported.en);
    expect(strategy.detect(pl, mocks.languages)).toEqual(mocks.languages.supported.pl);
  });

  test("missing", () => {
    const context = new RequestContextBuilder().build();

    expect(strategy.detect(context, mocks.languages)).toEqual(null);
  });

  test("unsupported", () => {
    const context = new RequestContextBuilder().withCookie(cookie, "es").build();

    expect(strategy.detect(context, mocks.languages)).toEqual(null);
  });
});
