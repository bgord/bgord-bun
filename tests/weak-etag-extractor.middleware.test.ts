import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { WeakETagExtractorMiddleware } from "../src/weak-etag-extractor.middleware";
import { RequestContextBuilder } from "./request-context-builder";

const middleware = new WeakETagExtractorMiddleware();

describe("WeakETagExtractorMiddleware", () => {
  test("valid header", () => {
    const context = new RequestContextBuilder()
      .withHeader(tools.WeakETag.IF_MATCH_HEADER_NAME, "W/12345")
      .build();

    const result = middleware.evaluate(context);

    expect(result?.revision).toEqual(12345);
    expect(result?.value).toEqual("W/12345");
  });

  test("missing header", () => {
    const context = new RequestContextBuilder().build();

    expect(middleware.evaluate(context)).toEqual(null);
  });

  test("invalid header - NaN", () => {
    const context = new RequestContextBuilder()
      .withHeader(tools.WeakETag.IF_MATCH_HEADER_NAME, "invalid")
      .build();

    expect(middleware.evaluate(context)).toEqual(null);
  });

  test("invalid header - undefined string", () => {
    const context = new RequestContextBuilder()
      .withHeader(tools.WeakETag.IF_MATCH_HEADER_NAME, "undefined")
      .build();

    expect(middleware.evaluate(context)).toEqual(null);
  });

  test("invalid header - negative", () => {
    const context = new RequestContextBuilder()
      .withHeader(tools.WeakETag.IF_MATCH_HEADER_NAME, "W/-1")
      .build();

    expect(middleware.evaluate(context)).toEqual(null);
  });
});
