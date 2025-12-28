import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ShieldTimeoutStrategy } from "../src/shield-timeout.strategy";

const duration = tools.Duration.Ms(5);
const shield = new ShieldTimeoutStrategy({ duration });

describe("ShieldTimeoutStrategy", () => {
  test("happy path", async () => {
    const app = new Hono().use(shield.verify).get("/ping", async (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
  });

  test("denied", async () => {
    jest.useFakeTimers();
    const app = new Hono().use(shield.verify).get("/ping", async (c) => {
      jest.advanceTimersByTime(duration.times(tools.MultiplicationFactor.parse(2)).ms);
      return c.text("OK");
    });

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(408);

    jest.useRealTimers();
  });
});
