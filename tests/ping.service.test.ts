import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { Ping } from "../src/ping.service";

describe("Ping Service", async () => {
  test("happy path", async () => {
    const app = new Hono().get("/ping", ...Ping.build());

    const response = await app.request("/ping");
    const text = await response.text();

    expect(response.status).toEqual(200);
    expect(text).toEqual("pong");
  });
});
