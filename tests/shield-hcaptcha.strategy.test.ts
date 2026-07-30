import { describe, expect, spyOn, test } from "bun:test";
import { HCaptchaService } from "../src/hcaptcha.service";
import { ShieldHcaptchaStrategy, ShieldHcaptchaStrategyField } from "../src/shield-hcaptcha.strategy";
import { ShieldHcaptchaLocalHonoStrategy } from "../src/shield-hcaptcha-hono-local.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const INVALID_TOKEN = "invalid-token";

const strategy = new ShieldHcaptchaStrategy(ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"]);

const valid = new FormData();
valid.set(ShieldHcaptchaStrategyField, ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"]);

const invalid = new FormData();
invalid.set(ShieldHcaptchaStrategyField, INVALID_TOKEN);

describe("ShieldHcaptchaStrategy", () => {
  test("happy path", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: true });
    const context = new RequestContextBuilder().withForm(valid).build();

    expect(await strategy.evaluate(context)).toEqual(true);
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"],
    );
  });

  test("failure - known error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });
    const context = new RequestContextBuilder().withForm(invalid).build();

    expect(await strategy.evaluate(context)).toEqual(false);
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      INVALID_TOKEN,
    );
  });

  test("failure - missing token", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });
    const context = new RequestContextBuilder().withForm(new FormData()).build();

    expect(await strategy.evaluate(context)).toEqual(false);
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      undefined,
    );
  });

  test("failure - unknown error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockImplementation(
      mocks.throwIntentionalError,
    );
    const context = new RequestContextBuilder().withForm(valid).build();

    expect(await strategy.evaluate(context)).toEqual(false);
    expect(hcaptchaVerify).toHaveBeenCalledWith(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"],
    );
  });
});
