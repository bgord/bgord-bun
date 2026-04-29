import { describe, expect, spyOn, test } from "bun:test";
import { HCaptchaService } from "../src/hcaptcha.service";
import { ShieldHcaptchaLocalHonoStrategy } from "../src/shield-hcaptcha-hono-local.strategy";
import * as mocks from "./mocks";

const INVALID_TOKEN = "invalid-token";

const service = new HCaptchaService();

describe("HCaptchaService", () => {
  test("verify - happy path", async () => {
    using globalFetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const result = await service.verify(
      ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
      ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"],
    );

    expect(result).toEqual({ success: true });
    expect(globalFetch).toHaveBeenCalledWith("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
        response: ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"],
      }),
    });
  });

  test("verify - failure - hcaptcha rejected token", async () => {
    using globalFetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 200 }),
    );

    const result = await service.verify(ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"], INVALID_TOKEN);

    expect(result).toEqual({ success: false });
    expect(globalFetch).toHaveBeenCalledWith("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
        response: INVALID_TOKEN,
      }),
    });
  });

  test("verify - failure - missing token", async () => {
    using globalFetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 200 }),
    );

    const result = await service.verify(ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"], undefined);

    expect(result).toEqual({ success: false });
    expect(globalFetch).toHaveBeenCalledWith("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
        response: "",
      }),
    });
  });

  test("verify - failure - http error", async () => {
    using _ = spyOn(globalThis, "fetch").mockResolvedValue(new Response("error", { status: 500 }));

    expect(async () =>
      service.verify(
        ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
        ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"],
      ),
    ).toThrow("hcaptcha.service.error");
  });

  test("verify - failure - network error", async () => {
    using _ = spyOn(globalThis, "fetch").mockRejectedValue(mocks.IntentionalError);

    expect(async () =>
      service.verify(
        ShieldHcaptchaLocalHonoStrategy["SECRET_KEY_LOCAL"],
        ShieldHcaptchaLocalHonoStrategy["TOKEN_LOCAL"],
      ),
    ).toThrow(mocks.IntentionalError);
  });
});
