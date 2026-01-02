import { describe, expect, test } from "bun:test";
import { RedactorMaskStrategy } from "../src/redactor-mask.strategy";

const redactor = new RedactorMaskStrategy(["password", "authorization", "x-api-key", "refreshToken"]);

describe("RedactorMaskStrategy", () => {
  test("happy path", () => {
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

  test("happy path - nested", () => {
    const input = { password: { nested: "x" }, authorization: 123, ok: true };

    // @ts-expect-error
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

    expect(new RedactorMaskStrategy().redact(input)).toEqual({
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
});
