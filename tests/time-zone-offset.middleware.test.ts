import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { TimeZoneOffsetMiddleware } from "../src/time-zone-offset.middleware";
import { RequestContextBuilder } from "./request-context-builder";

const middleware = new TimeZoneOffsetMiddleware();

describe("TimeZoneOffsetMiddleware", () => {
  test("valid header - positive", () => {
    const context = new RequestContextBuilder()
      .withHeader(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "120")
      .build();

    expect(middleware.evaluate(context)).toEqual(tools.Duration.Minutes(120));
  });

  test("valid header - negative", () => {
    const context = new RequestContextBuilder()
      .withHeader(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "-120")
      .build();

    expect(middleware.evaluate(context)).toEqual(tools.Duration.Minutes(-120));
  });

  test("missing header", () => {
    const context = new RequestContextBuilder().build();

    expect(middleware.evaluate(context)).toEqual(tools.Duration.Minutes(0));
  });

  test("empty header", () => {
    const context = new RequestContextBuilder()
      .withHeader(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "")
      .build();

    expect(middleware.evaluate(context)).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid header - format", () => {
    const context = new RequestContextBuilder()
      .withHeader(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "invalid-offset")
      .build();

    expect(middleware.evaluate(context)).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid header - below min", () => {
    const context = new RequestContextBuilder()
      .withHeader(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "-841")
      .build();

    expect(middleware.evaluate(context)).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid header - above max", () => {
    const context = new RequestContextBuilder()
      .withHeader(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "721")
      .build();

    expect(middleware.evaluate(context)).toEqual(tools.Duration.Minutes(0));
  });
});
