import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ETagExtractorHeaderStrategy } from "../src/etag-extractor-header.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const strategy = new ETagExtractorHeaderStrategy();

describe("ETagExtractorHeaderStrategy", () => {
  test("valid header", () => {
    const context = new RequestContextBuilder().withHeader(tools.ETag.IF_MATCH_HEADER_NAME, "12345").build();

    const result = strategy.detect(context);

    expect(result?.revision).toEqual(12345);
    expect(result?.value).toEqual("12345");
  });

  test("missing header", () => {
    const context = new RequestContextBuilder().build();

    expect(strategy.detect(context)).toEqual(null);
  });

  test("invalid header - NaN", () => {
    const context = new RequestContextBuilder()
      .withHeader(tools.ETag.IF_MATCH_HEADER_NAME, "invalid")
      .build();

    expect(strategy.detect(context)).toEqual(null);
  });

  test("invalid header - undefined string", () => {
    const context = new RequestContextBuilder()
      .withHeader(tools.ETag.IF_MATCH_HEADER_NAME, "undefined")
      .build();

    expect(strategy.detect(context)).toEqual(null);
  });

  test("invalid header - negative", () => {
    const context = new RequestContextBuilder().withHeader(tools.ETag.IF_MATCH_HEADER_NAME, "-1").build();

    expect(strategy.detect(context)).toEqual(null);
  });
});
