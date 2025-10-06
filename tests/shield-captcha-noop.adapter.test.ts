import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { ShieldCaptchaNoop } from "../src/shield-captcha-noop.adapter";

describe("ShieldCaptchaNoop", () => {
  test("allows requests through to downstream handler", async () => {
    const shield = new ShieldCaptchaNoop();

    const app = new Hono();
    app.use("/secure", shield.verify);
    app.post("/secure", (c) => c.text("OK"));

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
  });
});
