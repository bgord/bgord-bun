import { describe, expect, test } from "bun:test";
import { BasicAuth } from "../src/basic-auth.service";
import { BasicAuthPassword } from "../src/basic-auth-password.vo";
import { BasicAuthUsername } from "../src/basic-auth-username.vo";

const username = BasicAuthUsername.parse("admin");
const password = BasicAuthPassword.parse("password");

// cSpell:ignore YWRtaW46cGFzc3dvcmQ
const result = { authorization: "Basic YWRtaW46cGFzc3dvcmQ=" };

describe("BasicAuth", () => {
  test("toHeaderValue", () => {
    expect(BasicAuth.toHeaderValue(username, password)).toEqual(result);
  });

  test("toHeader", () => {
    expect(BasicAuth.toHeader(username, password)).toBeInstanceOf(Headers);
    expect(BasicAuth.toHeader(username, password).toJSON()).toEqual(result);
  });
});
