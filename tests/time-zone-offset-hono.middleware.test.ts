import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { TimeZoneOffsetMiddleware } from "../src/time-zone-offset.middleware";
import type { TimeZoneOffsetVariables } from "../src/time-zone-offset-hono.middleware";
import { TimeZoneOffsetHonoMiddleware } from "../src/time-zone-offset-hono.middleware";

const middleware = new TimeZoneOffsetHonoMiddleware();
const app = new Hono<{ Variables: TimeZoneOffsetVariables }>()
  .use(middleware.handle())
  .get("/ping", (c) => c.json(c.get("timeZoneOffset")));

describe("TimeZoneOffsetHonoMiddleware", () => {
  test("valid header - positive", async () => {
    const response = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME]: "120" }),
    });

    expect(tools.Duration.Ms(await response.json())).toEqual(tools.Duration.Minutes(120));
  });

  test("valid header - negative", async () => {
    const response = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME]: "-120" }),
    });

    expect(tools.Duration.Ms(await response.json())).toEqual(tools.Duration.Minutes(-120));
  });

  test("missing header", async () => {
    const response = await app.request("/ping", { method: "GET" });

    expect(tools.Duration.Ms(await response.json())).toEqual(tools.Duration.Minutes(0));
  });

  test("empty header", async () => {
    const response = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME]: "" }),
    });

    expect(tools.Duration.Ms(await response.json())).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid header - format", async () => {
    const response = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME]: "invalid-offset" }),
    });

    expect(tools.Duration.Ms(await response.json())).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid header - below min", async () => {
    const response = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME]: "-841" }),
    });

    expect(tools.Duration.Ms(await response.json())).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid header - above max", async () => {
    const response = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME]: "721" }),
    });

    expect(tools.Duration.Ms(await response.json())).toEqual(tools.Duration.Minutes(0));
  });
});
