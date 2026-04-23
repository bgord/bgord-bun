import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ETagExtractorFixedStrategy } from "../src/etag-extractor-fixed.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const value = tools.ETag.fromHeader("12345");

const context = new RequestContextBuilder().build();

describe("ETagExtractorFixedStrategy", () => {
  test("value", () => {
    const strategy = new ETagExtractorFixedStrategy(value);

    const result = strategy.detect(context);

    expect(result?.revision).toEqual(12345);
    expect(result?.value).toEqual("12345");
  });

  test("null", () => {
    const strategy = new ETagExtractorFixedStrategy(null);

    expect(strategy.detect(context)).toEqual(null);
  });
});
