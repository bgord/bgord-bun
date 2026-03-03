import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { Context, type ContextVariables } from "../src/context.middleware";
import { TimeZoneOffsetHonoMiddleware } from "../src/time-zone-offset-hono.middleware";

describe("Context middleware", () => {
  test("happy path", async () => {
    const app = new Hono<{ Variables: ContextVariables }>()
      .use(requestId())
      .use(new TimeZoneOffsetHonoMiddleware().handle())
      .use(Context.attach)
      .get("/ping", (c) => c.json(c.get("context")));

    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(typeof json.requestId).toEqual("string");
    expect(json.requestId.length).toEqual(36);
    expect(json.timeZoneOffset).toEqual(0);
  });
});
