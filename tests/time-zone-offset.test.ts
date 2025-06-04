import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";

import { TimeZoneOffset, TimeZoneOffsetVariables } from "../src/time-zone-offset";

describe("TimeZoneOffset middleware", () => {
  test("sets timeZoneOffset for valid header", async () => {
    const app = new Hono<{ Variables: TimeZoneOffsetVariables }>();
    app.use(TimeZoneOffset.attach);
    app.get("/ping", (c) => c.json(c.get("timeZoneOffset")));

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({
        [TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME]: "120",
      }),
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual({
      minutes: tools.Time.Minutes(120).minutes,
      seconds: tools.Time.Minutes(120).seconds,
      miliseconds: tools.Time.Minutes(120).ms,
    });
  });

  test("handles missing time-zone-offset header gracefully", async () => {
    const app = new Hono<{ Variables: TimeZoneOffsetVariables }>();
    app.use(TimeZoneOffset.attach);
    app.get("/ping", (c) => c.json(c.get("timeZoneOffset")));

    const result = await app.request("/ping", {
      method: "GET",
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual({
      minutes: 0,
      seconds: 0,
      miliseconds: 0,
    });
  });

  test("handles invalid time-zone-offset header gracefully", async () => {
    const app = new Hono<{ Variables: TimeZoneOffsetVariables }>();
    app.use(TimeZoneOffset.attach);
    app.get("/ping", (c) => c.json(c.get("timeZoneOffset")));

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({
        [TimeZoneOffset.TIME_ZONE_OFFSET_HEADER_NAME]: "invalid-offset",
      }),
    });

    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual({
      minutes: 0,
      seconds: 0,
      miliseconds: 0,
    });
  });
});
