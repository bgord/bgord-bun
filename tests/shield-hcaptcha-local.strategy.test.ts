import { describe, expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { HCaptchaService } from "../src/hcaptcha.service";
import { HCaptchaSecretKey } from "../src/hcaptcha-secret-key.vo";
import { ShieldHcaptchaLocalStrategy } from "../src/shield-hcaptcha-local.strategy";
import * as mocks from "./mocks";

const SECRET_KEY = HCaptchaSecretKey.parse("00000000000000000000000000000000000");
const LOCAL_FIXED_TOKEN = "10000000-aaaa-bbbb-cccc-000000000001";

const shield = new ShieldHcaptchaLocalStrategy(SECRET_KEY);

const app = new Hono().use("/secure", shield.verify).post("/secure", (c) => c.text("OK"));

describe("ShieldHcaptchaLocalStrategy", () => {
  test("happy path", async () => {
    const hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: true });

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);
  });

  test("failure - known error", async () => {
    const hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha.local");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);
  });

  test("failure - uknown error", async () => {
    const hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockRejectedValue(
      new Error(mocks.IntentionalError),
    );

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("shield.hcaptcha.local");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);
  });
});
