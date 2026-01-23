import { describe, expect, test } from "bun:test";
import { BasicAuth } from "../src/basic-auth.service";
import { BasicAuthPassword } from "../src/basic-auth-password.vo";
import { BasicAuthUsername } from "../src/basic-auth-username.vo";

// cSpell:ignore YWRtaW46cGFzc3dvcmQ
const result = { authorization: "Basic YWRtaW46cGFzc3dvcmQ=" };
const config = { username: BasicAuthUsername.parse("admin"), password: BasicAuthPassword.parse("password") };

describe("BasicAuth service", () => {
  test("toHeaderValue", () => {
    expect(BasicAuth.toHeaderValue(config)).toEqual(result);
  });

  test("toHeader", () => {
    expect(BasicAuth.toHeader(config).toJSON()).toEqual(result);
  });
});
