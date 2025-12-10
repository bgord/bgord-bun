import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { ShieldNoopAdapter } from "../src/shield-noop.adapter";

describe("ShieldNoopAdapter", () => {
  test("happy path", async () => {
    const shield = new ShieldNoopAdapter();

    const app = new Hono().use("/secure", shield.verify).post("/secure", (c) => c.text("OK"));

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
  });
});
