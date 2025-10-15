import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { Context, type ContextVariables } from "../src/context.middleware";
import { TimeZoneOffset } from "../src/time-zone-offset.middleware";

describe("Context", () => {
  test("applyTo", async () => {
    const app = new Hono<{ Variables: ContextVariables }>()
      .use(requestId())
      .use(TimeZoneOffset.attach)
      .use(Context.attach)
      .get("/ping", (c) => c.json(c.get("context")));

    const result = await app.request("/ping", { method: "GET" });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(typeof json.requestId).toEqual("string");
    expect(json.requestId.length).toEqual(36);
    expect(json.timeZoneOffset).toEqual({ internal: 0 });
  });
});
