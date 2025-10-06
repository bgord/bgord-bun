import { describe, expect, spyOn, test } from "bun:test";
import hcaptcha from "hcaptcha";
import { Hono } from "hono";
import { HCaptchaSecretKey, ShieldCaptchaHcaptcha } from "../src/shield-captcha-hcaptcha.adapter";

const SECRET_KEY = "0x1111111111111111111111111111111111111111";

const shield = new ShieldCaptchaHcaptcha(HCaptchaSecretKey.parse(SECRET_KEY));

const app = new Hono();
app.use("/secure", shield.verify);
app.post("/secure", (c) => c.text("OK"));

describe("ShieldCaptchaHcaptcha", () => {
  test("allows request when hcaptcha.verify resolves success=true", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({ success: true });

    const form = new FormData();
    form.set("h-captcha-response", "valid-token");
    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, "valid-token");
  });

  test("rejects request when hcaptcha.verify resolves success=false", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({ success: false });

    const form = new FormData();
    form.set("h-captcha-response", "invalid-token");
    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("access_denied_hcaptcha");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, "invalid-token");
  });

  test("rejects request when hcaptcha token is missing", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({ success: false });

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("access_denied_hcaptcha");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, undefined);
  });

  test("rejects request when hcaptcha.verify throws", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockRejectedValueOnce(new Error("network"));

    const form = new FormData();
    form.set("h-captcha-response", "any-token");

    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("access_denied_hcaptcha");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, "any-token");
  });
});
