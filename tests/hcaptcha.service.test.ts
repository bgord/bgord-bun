import { describe, expect, spyOn, test } from "bun:test";
import { HCaptchaService } from "../src/hcaptcha.service";
import { HCaptchaSecretKey } from "../src/hcaptcha-secret-key.vo";
import * as mocks from "./mocks";

const SECRET_KEY = HCaptchaSecretKey.parse("00000000000000000000000000000000000");
const VALID_TOKEN = "valid-token";
const INVALID_TOKEN = "invalid-token";
const LOCAL_FIXED_TOKEN = "10000000-aaaa-bbbb-cccc-000000000001";

const service = new HCaptchaService();

describe("HCaptchaService", () => {
  test("verify - happy path", async () => {
    const globalFetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const result = await service.verify(SECRET_KEY, VALID_TOKEN);

    expect(result).toEqual({ success: true });
    expect(globalFetch).toHaveBeenCalledWith("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: SECRET_KEY, response: VALID_TOKEN }),
    });
  });

  test("verify - failure - hcaptcha rejected token", async () => {
    const globalFetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 200 }),
    );

    const result = await service.verify(SECRET_KEY, INVALID_TOKEN);

    expect(result).toEqual({ success: false });
    expect(globalFetch).toHaveBeenCalledWith("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: SECRET_KEY, response: INVALID_TOKEN }),
    });
  });

  test("verify - failure - missing token", async () => {
    const globalFetch = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 200 }),
    );

    const result = await service.verify(SECRET_KEY, undefined);

    expect(result).toEqual({ success: false });
    expect(globalFetch).toHaveBeenCalledWith("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: SECRET_KEY, response: "" }),
    });
  });

  test("verify - failure - http error", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(new Response("error", { status: 500 }));

    expect(async () => service.verify(SECRET_KEY, VALID_TOKEN)).toThrow("hcaptcha.service.error");
  });

  test("verify - failure - network error", async () => {
    spyOn(globalThis, "fetch").mockRejectedValue(new Error(mocks.IntentionalError));

    expect(async () => service.verify(SECRET_KEY, VALID_TOKEN)).toThrow(mocks.IntentionalError);
  });

  test("verifyLocal - happy path", async () => {
    const result = await service.verifyLocal(LOCAL_FIXED_TOKEN);

    expect(result).toEqual({ success: true });
  });

  test("verifyLocal - failure - invalid token", async () => {
    const result = await service.verifyLocal(INVALID_TOKEN);

    expect(result).toEqual({ success: false });
  });

  test("verifyLocal - failure - missing token", async () => {
    const result = await service.verifyLocal(undefined);

    expect(result).toEqual({ success: false });
  });
});
