import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { LivenessHonoHandler } from "../src/liveness-hono.handler";

describe("LivenessHonoHandler", () => {
  test("happy path", async () => {
    const app = new Hono().get("/liveness", ...new LivenessHonoHandler().handle());

    const response = await app.request("/liveness");

    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({ ok: true });
  });
});
