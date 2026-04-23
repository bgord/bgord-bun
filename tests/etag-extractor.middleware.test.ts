import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ETagExtractorMiddleware } from "../src/etag-extractor.middleware";
import { ETagExtractorHeaderStrategy } from "../src/etag-extractor-header.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const strategy = new ETagExtractorHeaderStrategy();
const middleware = new ETagExtractorMiddleware({ strategy });

describe("ETagExtractorMiddleware", () => {
  test("valid header", () => {
    const context = new RequestContextBuilder().withHeader(tools.ETag.IF_MATCH_HEADER_NAME, "12345").build();

    const result = middleware.evaluate(context);

    expect(result?.revision).toEqual(12345);
    expect(result?.value).toEqual("12345");
  });

  test("missing header", () => {
    const context = new RequestContextBuilder().build();

    expect(middleware.evaluate(context)).toEqual(null);
  });

  test("invalid header - NaN", () => {
    const context = new RequestContextBuilder()
      .withHeader(tools.ETag.IF_MATCH_HEADER_NAME, "invalid")
      .build();

    expect(middleware.evaluate(context)).toEqual(null);
  });

  test("invalid header - undefined string", () => {
    const context = new RequestContextBuilder()
      .withHeader(tools.ETag.IF_MATCH_HEADER_NAME, "undefined")
      .build();

    expect(middleware.evaluate(context)).toEqual(null);
  });

  test("invalid header - negative", () => {
    const context = new RequestContextBuilder().withHeader(tools.ETag.IF_MATCH_HEADER_NAME, "-1").build();

    expect(middleware.evaluate(context)).toEqual(null);
  });
});
