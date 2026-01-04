import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { TimeZoneOffset, type TimeZoneOffsetVariables } from "../src/time-zone-offset.middleware";

const app = new Hono<{ Variables: TimeZoneOffsetVariables }>()
  .use(TimeZoneOffset.attach)
  .get("/ping", (c) => c.json(c.get("timeZoneOffset")));

describe("TimeZoneOffset middleware", () => {
  test("valid header - positive", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME]: "120" }),
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual(tools.Duration.Minutes(120));
  });

  test("valid header - negative", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME]: "-120" }),
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual(tools.Duration.Minutes(-120));
  });

  test("missing header", async () => {
    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual(tools.Duration.Minutes(0));
  });

  test("empty header", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME]: "" }),
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid heaeder - format", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME]: "invalid-offset" }),
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid header - below min", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME]: "-841" }),
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid header - above max", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME]: "721" }),
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual(tools.Duration.Minutes(0));
  });

  test("adjustDate", () => {
    const timestamp = tools.Timestamp.fromNumber(1_000_000);
    const offset = tools.Duration.Ms(100_000);

    expect(TimeZoneOffset.adjustDate(timestamp, offset)).toEqual(
      new Date(tools.Timestamp.fromNumber(900_000).ms),
    );
  });
});
