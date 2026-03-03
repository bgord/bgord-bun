import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { MiddlewareHonoNoopAdapter } from "../src/middleware-hono-noop.adapter";

describe("MiddlewareHonoNoopAdapter", () => {
  test("happy path", async () => {
    const shield = new MiddlewareHonoNoopAdapter();
    const app = new Hono().use("/secure", shield.handle()).post("/secure", (c) => c.text("OK"));

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
  });
});
