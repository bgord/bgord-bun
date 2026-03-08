import { describe, expect, test } from "bun:test";
import { LanguageDetectorHeaderStrategy } from "../src/language-detector-header.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const header = "Accept-Language";
const strategy = new LanguageDetectorHeaderStrategy();

describe("LanguageDetectorHeaderStrategy", () => {
  test("happy path", () => {
    const en = new RequestContextBuilder().withHeader(header, mocks.languages.supported.en).build();
    const pl = new RequestContextBuilder().withHeader(header, mocks.languages.supported.pl).build();

    expect(strategy.detect(en, mocks.languages)).toEqual(mocks.languages.supported.en);
    expect(strategy.detect(pl, mocks.languages)).toEqual(mocks.languages.supported.pl);
  });

  test("happy path - language with region", () => {
    const enUS = new RequestContextBuilder().withHeader(header, "en-US").build();
    const plPL = new RequestContextBuilder().withHeader(header, "pl-PL").build();

    expect(strategy.detect(enUS, mocks.languages)).toEqual(mocks.languages.supported.en);
    expect(strategy.detect(plPL, mocks.languages)).toEqual(mocks.languages.supported.pl);
  });

  test("happy path - multiple languages with quality values", () => {
    const context = new RequestContextBuilder().withHeader(header, "en-US,en;q=0.9,pl;q=0.8").build();

    expect(strategy.detect(context, mocks.languages)).toEqual(mocks.languages.supported.en);
  });

  test("happy path - first supported language", () => {
    const context = new RequestContextBuilder().withHeader(header, "de,pl,en").build();

    expect(strategy.detect(context, mocks.languages)).toEqual(mocks.languages.supported.pl);
  });

  test("whitespace", () => {
    const context = new RequestContextBuilder().withHeader(header, " en-US , pl ; q=0.8 ").build();

    expect(strategy.detect(context, mocks.languages)).toEqual(mocks.languages.supported.en);
  });

  test("empty segments", () => {
    const context = new RequestContextBuilder().withHeader(header, ";q=0.9,pl").build();

    expect(strategy.detect(context, mocks.languages)).toEqual(mocks.languages.supported.pl);
  });

  test("malformed", () => {
    const context = new RequestContextBuilder().withHeader(header, "de,,pl").build();

    expect(strategy.detect(context, mocks.languages)).toEqual(mocks.languages.supported.pl);
  });

  test("missing", () => {
    const context = new RequestContextBuilder().build();

    expect(strategy.detect(context, mocks.languages)).toEqual(null);
  });

  test("unsupported", () => {
    const context = new RequestContextBuilder().withHeader(header, "es").build();

    expect(strategy.detect(context, mocks.languages)).toEqual(null);
  });
});
