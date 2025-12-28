import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { ShieldNoopStrategy } from "../src/shield-noop.strategy";

describe("ShieldNoopStrategy", () => {
  test("happy path", async () => {
    const shield = new ShieldNoopStrategy();
    const app = new Hono().use("/secure", shield.verify).post("/secure", (c) => c.text("OK"));

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
  });
});
