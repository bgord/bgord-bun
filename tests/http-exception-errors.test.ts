import { describe, expect, test } from "bun:test";
import { HttpExceptionErrors } from "../src/http-exception-errors";

describe("HttpExceptionErrors", () => {
  test("shield errors", () => {
    expect(HttpExceptionErrors.ShieldApiKeyRejected).toEqual("shield.api.key.rejected");
    expect(HttpExceptionErrors.ShieldAuthRejected).toEqual("shield.auth.rejected");
    expect(HttpExceptionErrors.ShieldBasicAuthRejected).toEqual("shield.basic.auth.rejected");
    expect(HttpExceptionErrors.ShieldBodyLimitTooBig).toEqual("shield.body.limit.rejected");
    expect(HttpExceptionErrors.ShieldCsrfRejected).toEqual("shield.csrf.rejected");
    expect(HttpExceptionErrors.ShieldHcaptchaRejected).toEqual("shield.hcaptcha.rejected");
    expect(HttpExceptionErrors.ShieldHcaptchaLocalRejected).toEqual("shield.hcaptcha.local.rejected");
    expect(HttpExceptionErrors.ShieldIpBlacklistRejected).toEqual("shield.ip.blacklist.rejected");
    expect(HttpExceptionErrors.ShieldIpWhitelistRejected).toEqual("shield.ip.whitelist.rejected");
    expect(HttpExceptionErrors.ShieldRateLimitRejected).toEqual("shield.rate.limit.rejected");
    expect(HttpExceptionErrors.ShieldRecaptchaRejected).toEqual("shield.recaptcha.rejected");
    expect(HttpExceptionErrors.ShieldTimeoutRejected).toEqual("shield.timeout.rejected");
    expect(HttpExceptionErrors.ShieldWebhookRejected).toEqual("shield.webhook.rejected");
  });

  test("file uploader errors", () => {
    expect(HttpExceptionErrors.MissingFile).toEqual("file.uploader.missing.file");
    expect(HttpExceptionErrors.EmptyFile).toEqual("file.uploader.empty.file");
    expect(HttpExceptionErrors.InvalidMime).toEqual("file.uploader.invalid.mime");
    expect(HttpExceptionErrors.SizeLimit).toEqual("file.uploader.size.limit");
  });

  test("no collapsed keys", () => {
    expect(Object.keys(HttpExceptionErrors)).toHaveLength(17);
    expect(new Set(Object.values(HttpExceptionErrors)).size).toEqual(17);
  });
});
