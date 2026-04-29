import { describe, expect, spyOn, test } from "bun:test";
import { HCaptchaService } from "../src/hcaptcha.service";
import { ShieldHcaptchaStrategy } from "../src/shield-hcaptcha.strategy";
import { ShieldHcaptchaLocalHonoStrategy } from "../src/shield-hcaptcha-hono-local.strategy";
import * as mocks from "./mocks";

const INVALID_TOKEN = "invalid-token";

const strategy = new ShieldHcaptchaStrategy(ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"]);

describe("ShieldHcaptchaStrategy", () => {
  test("happy path", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: true });

    expect(await strategy.evaluate(ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"])).toEqual(true);
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"],
    );
  });

  test("failure - known error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });

    expect(await strategy.evaluate(INVALID_TOKEN)).toEqual(false);
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      INVALID_TOKEN,
    );
  });

  test("failure - missing token", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });

    expect(await strategy.evaluate(undefined)).toEqual(false);
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      undefined,
    );
  });

  test("failure - unknown error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockImplementation(
      mocks.throwIntentionalError,
    );

    expect(await strategy.evaluate("any-token")).toEqual(false);
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      "any-token",
    );
  });
});
