import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { TimeZoneOffset, type TimeZoneOffsetVariables } from "../src/time-zone-offset.middleware";

const app = new Hono<{ Variables: TimeZoneOffsetVariables }>()
  .use(TimeZoneOffset.attach)
  .get("/ping", (c) => c.json(c.get("timeZoneOffset")));

describe("TimeZoneOffset middleware", () => {
  test("valid header", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME]: "120" }),
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual(tools.Duration.Minutes(120));
  });

  test("missing time-zone-offset header", async () => {
    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual(tools.Duration.Minutes(0));
  });

  test("invalid time-zone-offset", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME]: "invalid-offset" }),
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual(tools.Duration.Minutes(0));
  });

  test("adjustDate", async () => {
    expect(
      TimeZoneOffset.adjustDate(tools.TimestampVO.fromNumber(1_000_000), tools.Duration.Ms(100_000)),
    ).toEqual(new Date(tools.TimestampVO.fromNumber(900_000).ms));
  });
});
