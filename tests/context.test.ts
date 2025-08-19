import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { Context, type ContextVariables } from "../src/context.middleware";
import { TimeZoneOffset } from "../src/time-zone-offset.middleware";

describe("Context class", () => {
  test("applyTo method adds context to the request", async () => {
    const app = new Hono<{ Variables: ContextVariables }>();
    app.use(requestId());
    app.use(TimeZoneOffset.attach);
    app.use(Context.attach);
    app.get("/ping", (c) => c.json(c.get("context")));

    const result = await app.request("/ping", { method: "GET" });
    const body = await result.json();

    expect(result.status).toEqual(200);
    expect(typeof body.requestId).toEqual("string");
    expect(body.requestId.length).toEqual(36);
    expect(body.timeZoneOffset).toEqual({
      miliseconds: 0,
      seconds: 0,
      minutes: 0,
    });
  });
});
