import { describe, expect, spyOn, test } from "bun:test";
import hcaptcha from "hcaptcha";
import { Hono } from "hono";
import { CaptchaShieldHcaptchaLocal } from "../src/captcha-shield-hcaptcha-local.adapter";

const SECRET_KEY = "0x1111111111111111111111111111111111111111";

// The fixed token used by the local shield implementation
const LOCAL_FIXED_TOKEN = "10000000-aaaa-bbbb-cccc-000000000001";

describe("CaptchaShieldHcaptchaLocal", () => {
  test("allows request when hcaptcha.verify resolves success=true", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({
      success: true,
    });

    const shield = new CaptchaShieldHcaptchaLocal(SECRET_KEY as any);

    const app = new Hono();
    app.use("/secure", shield.build);
    app.post("/secure", (c) => c.text("OK"));

    const response = await app.request("/secure", {
      method: "POST",
      body: new FormData(),
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("OK");

    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);

    hcaptchaVerify.mockRestore();
  });

  test("rejects request when hcaptcha.verify resolves success=false", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({
      success: false,
    });

    const shield = new CaptchaShieldHcaptchaLocal(SECRET_KEY as any);

    const app = new Hono();
    app.use("/secure", shield.build);
    app.post("/secure", (c) => c.text("OK"));

    const response = await app.request("/secure", {
      method: "POST",
      body: new FormData(),
    });

    expect(response.status).toBe(403);
    expect(await response.text()).toBe("access_denied_hcaptcha_local");

    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);

    hcaptchaVerify.mockRestore();
  });

  test("rejects request when hcaptcha.verify throws", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockRejectedValueOnce(new Error("network"));

    const shield = new CaptchaShieldHcaptchaLocal(SECRET_KEY as any);

    const app = new Hono();
    app.use("/secure", shield.build);
    app.post("/secure", (c) => c.text("OK"));

    const response = await app.request("/secure", {
      method: "POST",
      body: new FormData(),
    });

    expect(response.status).toBe(403);
    expect(await response.text()).toBe("access_denied_hcaptcha_local");

    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);

    hcaptchaVerify.mockRestore();
  });
});
