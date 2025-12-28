import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ShieldTimeoutStrategy } from "../src/shield-timeout.strategy";

const shield = new ShieldTimeoutStrategy({ duration: tools.Duration.Ms(5) });

describe("ShieldTimeoutStrategy", () => {
  test("happy path", async () => {
    const app = new Hono().use(shield.verify).get("/ping", async (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(200);
  });

  test("denied", async () => {
    const app = new Hono().use(shield.verify).get("/ping", async (c) => {
      await Bun.sleep(10);
      return c.text("OK");
    });

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(408);
  });
});
