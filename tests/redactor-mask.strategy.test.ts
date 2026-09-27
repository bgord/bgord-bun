import { describe, expect, test } from "bun:test";
import { RedactorMask } from "../src/redactor-mask.strategy";

const redactor = new RedactorMask(["password", "authorization", "x-api-key", "refreshToken"]);

describe("RedactorMask", () => {
  test("redact", () => {
    const input = {
      meta: { headers: { Authorization: "Bearer abc.def.ghi", "x-api-key": "XYZ-123" } },
      nested: [{ refreshToken: "r1-r2-r3" }, { Secret: "should-stay" }],
      password: "supersecret",
    };

    expect(redactor.redact(input)).toEqual({
      meta: { headers: { Authorization: "***", "x-api-key": "***" } },
      nested: [{ refreshToken: "***" }, { Secret: "should-stay" }],
      password: "***",
    });
  });

  test("redact - nested", () => {
    const input = { password: { nested: "x" }, authorization: 123, ok: true };

    // @ts-expect-error Changed schema assertion
    expect(redactor.redact(input)).toEqual({ password: "***", authorization: "***", ok: true });
  });

  test("default keys", () => {
    const input = {
      authorization: "a",
      cookie: "a",
      "set-cookie": "a",
      "x-api-key": "a",
      apiKey: "a",
      token: "a",
      accessToken: "a",
      refreshToken: "a",
      password: "a",
      currentPassword: "a",
      newPassword: "a",
      passwordConfirmation: "a",
      clientSecret: "a",
      secret: "a",
      otp: "a",
      code: "a",
    };

    expect(new RedactorMask().redact(input)).toEqual({
      authorization: "***",
      cookie: "***",
      "set-cookie": "***",
      "x-api-key": "***",
      apiKey: "***",
      token: "***",
      accessToken: "***",
      refreshToken: "***",
      password: "***",
      currentPassword: "***",
      newPassword: "***",
      passwordConfirmation: "***",
      clientSecret: "***",
      secret: "***",
      otp: "***",
      code: "***",
    });
  });

  test("default keys - snake_case variants", () => {
    const input = {
      access_token: "a",
      refresh_token: "a",
      password_confirmation: "a",
      client_secret: "a",
      private_key: "a",
      api_key: "a",
      "access-token": "a",
      "refresh-token": "a",
      "client-secret": "a",
      "private-key": "a",
      "api-key": "a",
    };

    expect(new RedactorMask().redact(input)).toEqual({
      access_token: "***",
      refresh_token: "***",
      password_confirmation: "***",
      client_secret: "***",
      private_key: "***",
      api_key: "***",
      "access-token": "***",
      "refresh-token": "***",
      "client-secret": "***",
      "private-key": "***",
      "api-key": "***",
    });
  });

  test("custom keys - separator variants", () => {
    const redactor = new RedactorMask(["client_secret"]);

    const input = { clientSecret: "a", "client-secret": "a", client_secret: "a", ok: "a" };

    expect(redactor.redact(input)).toEqual({
      clientSecret: "***",
      "client-secret": "***",
      client_secret: "***",
      ok: "a",
    });
  });
});
