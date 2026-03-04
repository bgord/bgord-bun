import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { ContextHonoMiddleware, type ContextVariables } from "../src/context-hono.middleware";
import { TimeZoneOffsetHonoMiddleware } from "../src/time-zone-offset-hono.middleware";

describe("ContextHonoMiddleware", () => {
  test("happy path", async () => {
    const context = new ContextHonoMiddleware();
    const app = new Hono<{ Variables: ContextVariables }>()
      .use(requestId())
      .use(new TimeZoneOffsetHonoMiddleware().handle())
      .use(context.handle())
      .get("/ping", (c) => c.json(c.get("context")));

    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(typeof json.requestId).toEqual("string");
    expect(json.requestId.length).toEqual(36);
    expect(json.timeZoneOffset).toEqual(0);
  });
});
