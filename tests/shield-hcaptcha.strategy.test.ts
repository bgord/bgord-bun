import { describe, expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { HCaptchaService } from "../src/hcaptcha.service";
import { HCaptchaSecretKey } from "../src/hcaptcha-secret-key.vo";
import { ShieldHcaptchaStrategy } from "../src/shield-hcaptcha.strategy";
import * as mocks from "./mocks";

const SECRET_KEY = "11111111111111111111111111111111111";
const VALID_TOKEN = "valid-token";
const INVALID_TOKEN = "invalid-token";

const shield = new ShieldHcaptchaStrategy(HCaptchaSecretKey.parse(SECRET_KEY));

const app = new Hono().use("/secure", shield.verify).post("/secure", (c) => c.text("OK"));

describe("ShieldHcaptchaStrategy", () => {
  test("happy path", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: true });
    const form = new FormData();
    form.set("h-captcha-response", VALID_TOKEN);

    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, VALID_TOKEN);
  });

  test("failure - known error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });
    const form = new FormData();
    form.set("h-captcha-response", INVALID_TOKEN);

    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, INVALID_TOKEN);
  });

  test("failure - missing token", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, undefined);
  });

  test("failure - unknown error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockImplementation(
      mocks.throwIntentionalError,
    );
    const form = new FormData();
    form.set("h-captcha-response", "any-token");

    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, "any-token");
  });
});
