import { describe, expect, spyOn, test } from "bun:test";
import hcaptcha from "hcaptcha";
import { Hono } from "hono";
import { ShieldCaptchaHcaptchaLocalAdapter } from "../src/shield-captcha-hcaptcha-local.adapter";
import * as mocks from "./mocks";

const SECRET_KEY = "0x1111111111111111111111111111111111111111";
const LOCAL_FIXED_TOKEN = "10000000-aaaa-bbbb-cccc-000000000001";

const shield = new ShieldCaptchaHcaptchaLocalAdapter(SECRET_KEY as any);

const app = new Hono().use("/secure", shield.verify).post("/secure", (c) => c.text("OK"));

describe("ShieldCaptchaHcaptchaLocalAdapter", () => {
  test("happy path", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValue({ success: true });

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("OK");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);
  });

  test("failure - known error", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockResolvedValue({ success: false });

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("access_denied_hcaptcha_local");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);
  });

  test("failure - uknown error", async () => {
    const hcaptchaVerify = spyOn(hcaptcha, "verify").mockRejectedValue(new Error(mocks.IntentionalError));

    const response = await app.request("/secure", { method: "POST", body: new FormData() });

    expect(response.status).toEqual(403);
    expect(await response.text()).toEqual("access_denied_hcaptcha_local");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);
  });
});
