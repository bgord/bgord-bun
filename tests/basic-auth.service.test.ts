import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { BasicAuth } from "../src/basic-auth.service";
import { BasicAuthPassword } from "../src/basic-auth-password.vo";
import { BasicAuthUsername } from "../src/basic-auth-username.vo";

// cSpell:ignore YWRtaW46cGFzc3dvcmQ
const result = { authorization: "Basic YWRtaW46cGFzc3dvcmQ=" };
const config = {
  username: v.parse(BasicAuthUsername, "admin"),
  password: v.parse(BasicAuthPassword, "password"),
};

describe("BasicAuth", () => {
  test("toHeaderValue", () => {
    expect(BasicAuth.toHeaderValue(config)).toEqual(result);
  });

  test("toHeader", () => {
    expect(BasicAuth.toHeader(config).toJSON()).toEqual(result);
  });
});
