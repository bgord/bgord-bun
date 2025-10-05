import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { TimeZoneOffset, type TimeZoneOffsetVariables } from "../src/time-zone-offset.middleware";

const app = new Hono<{ Variables: TimeZoneOffsetVariables }>();
app.use(TimeZoneOffset.attach);
app.get("/ping", (c) => c.json(c.get("timeZoneOffset")));

describe("TimeZoneOffset middleware", () => {
  test("sets timeZoneOffset for valid header", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME]: "120" }),
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual({ valueMs: tools.Duration.Minutes(120).ms });
  });

  test("handles missing time-zone-offset header gracefully", async () => {
    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual({ valueMs: 0 });
  });

  test("handles invalid time-zone-offset header gracefully", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ [TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME]: "invalid-offset" }),
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual({ valueMs: 0 });
  });

  test("adjustTimestamp", async () => {
    expect(
      TimeZoneOffset.adjustTimestamp(tools.Timestamp.parse(1_000_000), tools.Duration.Ms(100_000)),
    ).toEqual(tools.Timestamp.parse(900_000));
  });
});
