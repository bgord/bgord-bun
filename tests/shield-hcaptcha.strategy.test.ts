import { describe, expect, spyOn, test } from "bun:test";
import * as v from "valibot";
import { HCaptchaService } from "../src/hcaptcha.service";
import { HCaptchaSecretKey } from "../src/hcaptcha-secret-key.vo";
import { ShieldHcaptchaStrategy } from "../src/shield-hcaptcha.strategy";
import * as mocks from "./mocks";

const SECRET_KEY = "11111111111111111111111111111111111";
const VALID_TOKEN = "valid-token";
const INVALID_TOKEN = "invalid-token";

const strategy = new ShieldHcaptchaStrategy(v.parse(HCaptchaSecretKey, SECRET_KEY));

describe("ShieldHcaptchaStrategy", () => {
  test("happy path", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: true });

    expect(await strategy.evaluate(VALID_TOKEN)).toEqual(true);
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, VALID_TOKEN);
  });

  test("failure - known error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });

    expect(await strategy.evaluate(INVALID_TOKEN)).toEqual(false);
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, INVALID_TOKEN);
  });

  test("failure - missing token", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });

    expect(await strategy.evaluate(undefined)).toEqual(false);
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, undefined);
  });

  test("failure - unknown error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockImplementation(
      mocks.throwIntentionalError,
    );

    expect(await strategy.evaluate("any-token")).toEqual(false);
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, "any-token");
  });
});
