import { describe, expect, test } from "bun:test";
import { LanguageDetectorQueryStrategy } from "../src/language-detector-query.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const query = "language";
const strategy = new LanguageDetectorQueryStrategy(query);

describe("LanguageDetectorQueryStrategy", () => {
  test("happy path", () => {
    const en = new RequestContextBuilder().withQuery({ [query]: mocks.languages.supported.en }).build();
    const pl = new RequestContextBuilder().withQuery({ [query]: mocks.languages.supported.pl }).build();

    expect(strategy.detect(en, mocks.languages)).toEqual(mocks.languages.supported.en);
    expect(strategy.detect(pl, mocks.languages)).toEqual(mocks.languages.supported.pl);
  });

  test("missing", () => {
    const context = new RequestContextBuilder().build();

    expect(strategy.detect(context, mocks.languages)).toEqual(null);
  });

  test("unsupported", () => {
    const context = new RequestContextBuilder().withQuery({ [query]: "es" }).build();

    expect(strategy.detect(context, mocks.languages)).toEqual(null);
  });
});
