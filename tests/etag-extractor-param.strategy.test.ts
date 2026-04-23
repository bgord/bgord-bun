import { describe, expect, test } from "bun:test";
import { ETagExtractorParamStrategy } from "../src/etag-extractor-param.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const name = "revision";
const strategy = new ETagExtractorParamStrategy(name);

describe("ETagExtractorParamStrategy", () => {
  test("valid header", () => {
    const context = new RequestContextBuilder().withParams({ [name]: "12345" }).build();

    const result = strategy.detect(context);

    expect(result?.revision).toEqual(12345);
    expect(result?.value).toEqual("12345");
  });

  test("missing header", () => {
    const context = new RequestContextBuilder().build();

    expect(strategy.detect(context)).toEqual(null);
  });

  test("invalid header - NaN", () => {
    const context = new RequestContextBuilder().withParams({ [name]: "invalid" }).build();

    expect(strategy.detect(context)).toEqual(null);
  });

  test("invalid header - undefined string", () => {
    const context = new RequestContextBuilder().withParams({ [name]: "undefined" }).build();

    expect(strategy.detect(context)).toEqual(null);
  });

  test("invalid header - negative", () => {
    const context = new RequestContextBuilder().withParams({ [name]: "-1" }).build();

    expect(strategy.detect(context)).toEqual(null);
  });
});
