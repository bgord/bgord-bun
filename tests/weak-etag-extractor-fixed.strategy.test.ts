import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { WeakETagExtractorFixedStrategy } from "../src/weak-etag-extractor-fixed.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const value = tools.WeakETag.fromHeader("W/12345");

const context = new RequestContextBuilder().build();

describe("WeakETagExtractorFixedStrategy", () => {
  test("value", () => {
    const strategy = new WeakETagExtractorFixedStrategy(value);

    const result = strategy.detect(context);

    expect(result?.revision).toEqual(12345);
    expect(result?.value).toEqual("W/12345");
  });

  test("null", () => {
    const strategy = new WeakETagExtractorFixedStrategy(null);

    expect(strategy.detect(context)).toEqual(null);
  });
});
