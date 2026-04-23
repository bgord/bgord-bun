import { describe, expect, test } from "bun:test";
import { WeakETagExtractorParamStrategy } from "../src/weak-etag-extractor-param.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const name = "revision";
const strategy = new WeakETagExtractorParamStrategy(name);

describe("WeakETagExtractorParamStrategy", () => {
  test("valid param", () => {
    const context = new RequestContextBuilder().withParams({ [name]: "12345" }).build();

    const result = strategy.detect(context);

    expect(result?.revision).toEqual(12345);
    expect(result?.value).toEqual("W/12345");
  });

  test("missing param", () => {
    const context = new RequestContextBuilder().build();

    expect(strategy.detect(context)).toEqual(null);
  });

  test("invalid param - NaN", () => {
    const context = new RequestContextBuilder().withParams({ [name]: "invalid" }).build();

    expect(strategy.detect(context)).toEqual(null);
  });

  test("invalid param - undefined string", () => {
    const context = new RequestContextBuilder().withParams({ [name]: "undefined" }).build();

    expect(strategy.detect(context)).toEqual(null);
  });

  test("invalid param - negative", () => {
    const context = new RequestContextBuilder().withParams({ [name]: "-1" }).build();

    expect(strategy.detect(context)).toEqual(null);
  });
});
