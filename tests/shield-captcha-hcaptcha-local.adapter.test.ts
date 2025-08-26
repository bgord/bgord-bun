import { describe, expect, spyOn, test } from "bun:test";
import hcaptcha from "hcaptcha";
import { Hono } from "hono";
import { ShieldCaptchaHcaptchaLocal } from "../src/shield-captcha-hcaptcha-local.adapter";

const SECRET_KEY = "0x1111111111111111111111111111111111111111";

// The fixed token used by the local shield implementation
const LOCAL_FIXED_TOKEN = "10000000-aaaa-bbbb-cccc-000000000001";

const shield = new ShieldCaptchaHcaptchaLocal(SECRET_KEY as any);

describe("ShieldCaptchaHcaptchaLocal", () => {
  test("allows request when hcaptcha.verify resolves success=true", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({
      success: true,
    });

    const app = new Hono();
    app.use("/secure", shield.verify);
    app.post("/secure", (c) => c.text("OK"));

    const response = await app.request("/secure", {
      method: "POST",
      body: new FormData(),
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("OK");

    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);
  });

  test("rejects request when hcaptcha.verify resolves success=false", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({
      success: false,
    });

    const app = new Hono();
    app.use("/secure", shield.verify);
    app.post("/secure", (c) => c.text("OK"));

    const response = await app.request("/secure", {
      method: "POST",
      body: new FormData(),
    });

    expect(response.status).toBe(403);
    expect(await response.text()).toBe("access_denied_hcaptcha_local");

    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);
  });

  test("rejects request when hcaptcha.verify throws", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockRejectedValueOnce(new Error("network"));

    const app = new Hono();
    app.use("/secure", shield.verify);
    app.post("/secure", (c) => c.text("OK"));

    const response = await app.request("/secure", {
      method: "POST",
      body: new FormData(),
    });

    expect(response.status).toBe(403);
    expect(await response.text()).toBe("access_denied_hcaptcha_local");

    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);
  });
});
