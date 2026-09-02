import { describe, expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { HCaptchaService } from "../src/hcaptcha.service";
import { ShieldHcaptchaHonoStrategy } from "../src/shield-hcaptcha-hono.strategy";
import { ShieldHcaptchaLocalHonoStrategy } from "../src/shield-hcaptcha-hono-local.strategy";
import * as mocks from "./mocks";

const INVALID_TOKEN = "invalid-token";

const shield = new ShieldHcaptchaHonoStrategy({
  secretKey: ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
  hostname: ShieldHcaptchaLocalHonoStrategy["HOSTNAME_LOCAL"],
});

const app = new Hono().use("/secure", shield.handle()).post("/secure", () => new Response("OK"));

describe("ShieldHcaptchaHonoStrategy", () => {
  test("happy path", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({
      success: true,
      hostname: ShieldHcaptchaLocalHonoStrategy["HOSTNAME_LOCAL"],
    });
    const form = new FormData();
    form.set("h-captcha-response", ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"]);

    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"],
    );
  });

  test("failure - known error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });
    const form = new FormData();
    form.set("h-captcha-response", INVALID_TOKEN);

    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha.rejected");
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      INVALID_TOKEN,
    );
  });

  test("happy path - json body fallback", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({
      success: true,
      hostname: ShieldHcaptchaLocalHonoStrategy["HOSTNAME_LOCAL"],
    });

    const response = await app.request("/secure", {
      method: "POST",
      body: JSON.stringify({ "h-captcha-response": ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"] }),
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"],
    );
  });

  test("failure - non-string json token", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({
      success: true,
      hostname: ShieldHcaptchaLocalHonoStrategy["HOSTNAME_LOCAL"],
    });

    const response = await app.request("/secure", {
      method: "POST",
      body: JSON.stringify({ "h-captcha-response": 123 }),
    });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha.rejected");
    expect(hcaptchaVerify).not.toHaveBeenCalled();
  });

  test("failure - missing token", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha.rejected");
    expect(hcaptchaVerify).not.toHaveBeenCalled();
  });

  test("failure - foreign hostname", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({
      success: true,
      hostname: "evil.example",
    });
    const form = new FormData();
    form.set("h-captcha-response", ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"]);

    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha.rejected");
    expect(hcaptchaVerify).toHaveBeenCalled();
  });

  test("failure - missing hostname", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: true });
    const form = new FormData();
    form.set("h-captcha-response", ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"]);

    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha.rejected");
    expect(hcaptchaVerify).toHaveBeenCalled();
  });

  test("failure - unknown error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockImplementation(
      mocks.throwIntentionalError,
    );
    const form = new FormData();
    form.set("h-captcha-response", "any-token");

    const response = await app.request("/secure", { method: "POST", body: form });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha.rejected");
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      "any-token",
    );
  });
});
