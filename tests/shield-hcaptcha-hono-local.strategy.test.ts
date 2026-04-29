import { describe, expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { HCaptchaService } from "../src/hcaptcha.service";
import { ShieldHcaptchaLocalHonoStrategy } from "../src/shield-hcaptcha-hono-local.strategy";
import * as mocks from "./mocks";

const shield = new ShieldHcaptchaLocalHonoStrategy();

const app = new Hono().use("/secure", shield.handle()).post("/secure", (c) => c.text("OK"));

describe("ShieldHcaptchaLocalStrategy", () => {
  test("happy path", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: true });

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"],
    );
  });

  test("failure - known error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha.local.rejected");
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"],
    );
  });

  test("failure - unknown error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockImplementation(
      mocks.throwIntentionalErrorAsync,
    );

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha.local.rejected");
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"],
    );
  });
});
