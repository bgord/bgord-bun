import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { ShieldCaptchaNoopAdapter } from "../src/shield-captcha-noop.adapter";

describe("ShieldCaptchaNoopAdapter", () => {
  test("happy path", async () => {
    const shield = new ShieldCaptchaNoopAdapter();

    const app = new Hono().use("/secure", shield.verify).post("/secure", (c) => c.text("OK"));

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
  });
});
