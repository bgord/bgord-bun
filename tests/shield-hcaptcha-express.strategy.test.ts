import { describe, expect, spyOn, test } from "bun:test";
import express from "express";
import request from "supertest";
import { HCaptchaService } from "../src/hcaptcha.service";
import { HCaptchaSecretKey } from "../src/hcaptcha-secret-key.vo";
import { ShieldHcaptchaExpressStrategy } from "../src/shield-hcaptcha-express.strategy";
import * as mocks from "./mocks";

const SECRET_KEY = "11111111111111111111111111111111111";
const VALID_TOKEN = "valid-token";
const INVALID_TOKEN = "invalid-token";

const shield = new ShieldHcaptchaExpressStrategy(HCaptchaSecretKey.parse(SECRET_KEY));

const app = express()
  .use(express.urlencoded({ extended: true }))
  .post("/secure", shield.handle(), (_request, response) => response.send("OK"));

describe("ShieldHcaptchaExpressStrategy", () => {
  test("happy path", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: true });

    const response = await request(app)
      .post("/secure")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send(`h-captcha-response=${VALID_TOKEN}`);

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("OK");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, VALID_TOKEN);
  });

  test("failure - known error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });

    const response = await request(app)
      .post("/secure")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send(`h-captcha-response=${INVALID_TOKEN}`);

    expect(response.status).toEqual(403);
    expect(response.text).toEqual("shield.hcaptcha.rejected");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, INVALID_TOKEN);
  });

  test("failure - missing token", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockResolvedValue({ success: false });

    const response = await request(app)
      .post("/secure")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send("dummy=1");

    expect(response.status).toEqual(403);
    expect(response.text).toEqual("shield.hcaptcha.rejected");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, undefined);
  });

  test("failure - unknown error", async () => {
    using hcaptchaVerify = spyOn(HCaptchaService.prototype, "verify").mockImplementation(
      mocks.throwIntentionalError,
    );

    const response = await request(app)
      .post("/secure")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send("h-captcha-response=any-token");

    expect(response.status).toEqual(403);
    expect(response.text).toEqual("shield.hcaptcha.rejected");
    expect(hcaptchaVerify).toHaveBeenCalledWith(SECRET_KEY, "any-token");
  });
});
