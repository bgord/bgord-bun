import { describe, expect, spyOn, test } from "bun:test";
import express from "express";
import request from "supertest";
import { HCaptchaService } from "../src/hcaptcha.service";
import { HCaptchaSecretKey } from "../src/hcaptcha-secret-key.vo";
import { ShieldHcaptchaExpressLocalStrategy } from "../src/shield-hcaptcha-express-local.strategy";
import * as mocks from "./mocks";

const SECRET_KEY = HCaptchaSecretKey.parse("00000000000000000000000000000000000");
const LOCAL_FIXED_TOKEN = "10000000-aaaa-bbbb-cccc-000000000001";

const shield = new ShieldHcaptchaExpressLocalStrategy(SECRET_KEY);

const app = express().post("/secure", shield.handle(), (_request, response) => response.send("OK"));

describe("ShieldHcaptchaExpressLocalStrategy", () => {
  test("happy path", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: true });

    const response = await request(app).post("/secure");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("OK");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);
  });

  test("failure - known error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });

    const response = await request(app).post("/secure");

    expect(response.status).toEqual(403);
    expect(response.text).toEqual("shield.hcaptcha.local.rejected");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);
  });

  test("failure - unknown error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockImplementation(
      mocks.throwIntentionalErrorAsync,
    );

    const response = await request(app).post("/secure");

    expect(response.status).toEqual(403);
    expect(response.text).toEqual("shield.hcaptcha.local.rejected");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, LOCAL_FIXED_TOKEN);
  });
});
