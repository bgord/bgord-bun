import { describe, expect, test } from "bun:test";
import {
  BasicAuth,
  BasicAuthPassword,
  BasicAuthPasswordLengthError,
  BasicAuthPasswordTypeError,
  BasicAuthUsername,
  BasicAuthUsernameLengthError,
  BasicAuthUsernameTypeError,
} from "../src/basic-auth.service";

describe("Basic auth validators", () => {
  test("BasicAuthUsername - valid", () => {
    expect(() => BasicAuthUsername.parse("admin")).not.toThrow();
  });

  test("BasicAuthUsername - invalid", () => {
    expect(() => BasicAuthUsername.parse(123)).toThrow(BasicAuthUsernameTypeError.error);
    expect(() => BasicAuthUsername.parse("")).toThrow(BasicAuthUsernameLengthError.error);
    expect(() => BasicAuthUsername.parse("u".repeat(129))).toThrow(BasicAuthUsernameLengthError.error);
  });

  test("BasicAuthPassword - valid", () => {
    expect(() => BasicAuthPassword.parse("secure-password123")).not.toThrow();
  });

  test("BasicAuthPassword - invalid", () => {
    expect(() => BasicAuthPassword.parse(123)).toThrow(BasicAuthPasswordTypeError.error);
    expect(() => BasicAuthPassword.parse("")).toThrow(BasicAuthPasswordLengthError.error);
    expect(() => BasicAuthPassword.parse("p".repeat(129))).toThrow(BasicAuthPasswordLengthError.error);
  });
});

describe("BasicAuth", () => {
  const username = BasicAuthUsername.parse("admin");
  const password = BasicAuthPassword.parse("password");

  // cSpell:ignore YWRtaW46cGFzc3dvcmQ
  const result = { authorization: "Basic YWRtaW46cGFzc3dvcmQ=" };

  test("toHeaderValue", () => {
    expect(BasicAuth.toHeaderValue(username, password)).toEqual(result);
  });

  test("toHeader", () => {
    expect(BasicAuth.toHeader(username, password)).toBeInstanceOf(Headers);
    expect(BasicAuth.toHeader(username, password).toJSON()).toEqual(result);
  });
});
