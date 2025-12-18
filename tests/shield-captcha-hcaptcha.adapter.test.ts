import { describe, expect, spyOn, test } from "bun:test";
import hcaptcha from "hcaptcha";
import { Hono } from "hono";
import { HCaptchaSecretKey } from "../src/hcaptcha-secret-key.vo";
import { ShieldCaptchaHcaptchaAdapter } from "../src/shield-captcha-hcaptcha.adapter";
import * as mocks from "./mocks";

const SECRET_KEY = "11111111111111111111111111111111111";
const VALID_TOKEN = "valid-token";
const INVALID_TOKEN = "invalid-token";

const shield = new ShieldCaptchaHcaptchaAdapter(HCaptchaSecretKey.parse(SECRET_KEY));

const app = new Hono().use("/secure", shield.verify).post("/secure", (c) => c.text("OK"));

describe("ShieldCaptchaHcaptchaAdapter", () => {
  test("happy path", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({ success: true });
    const form = new FormData();
    form.set("h-captcha-response", VALID_TOKEN);

    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, VALID_TOKEN);
  });

  test("failure - known error", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({ success: false });
    const form = new FormData();
    form.set("h-captcha-response", INVALID_TOKEN);

    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("access_denied_hcaptcha");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, INVALID_TOKEN);
  });

  test("failure - missing token", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValueOnce({ success: false });

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("access_denied_hcaptcha");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, undefined);
  });

  test("failure - unknown error", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockRejectedValueOnce(new Error(mocks.IntentionalError));
    const form = new FormData();
    form.set("h-captcha-response", "any-token");

    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("access_denied_hcaptcha");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, "any-token");
  });
});
