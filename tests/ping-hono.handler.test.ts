import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { PingHonoHandler } from "../src/ping-hono.handler";

describe("PingHonoHandler", () => {
  test("happy path", async () => {
    const ping = new PingHonoHandler();
    const app = new Hono().get("/ping", ...ping.handle());

    const response = await app.request("/ping");

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("pong");
  });
});
