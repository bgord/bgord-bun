import { describe, expect, spyOn, test } from "bun:test";
import hcaptcha from "hcaptcha";
import { Hono } from "hono";
import { HcaptchaShield } from "../src/hcaptcha-shield";

const SECRET_KEY = "0x1111111111111111111111111111111111111111";

const shield = new HcaptchaShield({
  secretKey: SECRET_KEY,
  mode: "production",
});

const app = new Hono();
app.use("/secure", shield.build);
app.post("/secure", (c) => c.text("OK"));

describe("RecaptchaShield", () => {
  test("allows request when hcaptcha is valid", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({
      success: true,
    });

    const form = new FormData();
    form.set("h-captcha-response", "valid-token");

    const response = await app.request("/secure", {
      method: "POST",
      body: form,
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("OK");

    hcaptchaVerify.mockRestore();
  });

  test("rejects request when hcaptcha is invalid", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({
      success: false,
    });

    const form = new FormData();
    form.set("h-captcha-response", "invalid-token");

    const response = await app.request("/secure", {
      method: "POST",
      body: form,
    });

    expect(response.status).toBe(403);
    expect(await response.text()).toBe("access_denied_recaptcha");

    hcaptchaVerify.mockRestore();
  });

  test("rejects request when hcaptcha token is missing", async () => {
    const response = await app.request("/secure", {
      method: "POST",
      body: new FormData(),
    });

    expect(response.status).toBe(403);
    expect(await response.text()).toBe("access_denied_recaptcha");
  });

  test("allows request in local mode without calling hcaptcha.verify", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({
      success: true,
    });

    const localShield = new HcaptchaShield({
      secretKey: SECRET_KEY,
      mode: "local",
    });

    const appWithLocalShield = new Hono();
    appWithLocalShield.use("/secure", localShield.build);
    appWithLocalShield.post("/secure", (c) => c.text("LOCAL OK"));

    expect(hcaptchaVerify).not.toHaveBeenCalled();

    const response = await appWithLocalShield.request("/secure", {
      method: "POST",
      body: new FormData(),
    });

    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, "10000000-aaaa-bbbb-cccc-000000000001");
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("LOCAL OK");

    hcaptchaVerify.mockRestore();
  });
});
