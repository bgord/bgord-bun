import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { CaptchaShieldNoop } from "../src/captcha-shield-noop.adapter";

describe("CaptchaShieldNoop", () => {
  test("allows requests through to downstream handler", async () => {
    const shield = new CaptchaShieldNoop();

    const app = new Hono();
    app.use("/secure", shield.build);
    app.post("/secure", (c) => c.text("OK"));

    const response = await app.request("/secure", {
      method: "POST",
      body: new FormData(),
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("OK");
  });
});
