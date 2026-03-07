import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import express from "express";
import request from "supertest";
import { TimeZoneOffsetMiddleware } from "../src/time-zone-offset.middleware";
import { TimeZoneOffsetExpressMiddleware } from "../src/time-zone-offset-express.middleware";

const middleware = new TimeZoneOffsetExpressMiddleware();
const app = express()
  .use(middleware.handle())
  .get("/ping", (req, res) => res.json(req.timeZoneOffset));

describe("TimeZoneOffsetExpressMiddleware", () => {
  test("valid header - positive", async () => {
    const response = await request(app)
      .get("/ping")
      .set(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "120");

    expect(tools.Duration.Ms(response.body)).toEqual(tools.Duration.Minutes(120));
  });

  test("valid header - negative", async () => {
    const response = await request(app)
      .get("/ping")
      .set(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "-120");

    expect(tools.Duration.Ms(response.body)).toEqual(tools.Duration.Minutes(-120));
  });

  test("missing header", async () => {
    const response = await request(app).get("/ping");

    expect(tools.Duration.Ms(response.body)).toEqual(tools.Duration.Minutes(0));
  });

  test("empty header", async () => {
    const response = await request(app)
      .get("/ping")
      .set(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "");

    expect(tools.Duration.Ms(response.body)).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid header - format", async () => {
    const response = await request(app)
      .get("/ping")
      .set(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "invalid-offset");

    expect(tools.Duration.Ms(response.body)).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid header - below min", async () => {
    const response = await request(app)
      .get("/ping")
      .set(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "-841");

    expect(tools.Duration.Ms(response.body)).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid header - above max", async () => {
    const response = await request(app)
      .get("/ping")
      .set(TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME, "721");

    expect(tools.Duration.Ms(response.body)).toEqual(tools.Duration.Minutes(0));
  });
});
