import { describe, expect, test } from "bun:test";
import { BasicAuthPassword } from "../src/basic-auth-password.vo";

describe("BasicAuthPassword VO", () => {
  test("happy path", () => {
    expect(BasicAuthPassword.safeParse("a".repeat(128)).success).toEqual(true);
    expect(BasicAuthPassword.safeParse("A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => BasicAuthPassword.parse(null)).toThrow("basic.auth.password.type");
  });

  test("rejects non-string - number", () => {
    expect(() => BasicAuthPassword.parse(123)).toThrow("basic.auth.password.type");
  });

  test("rejects empty", () => {
    expect(() => BasicAuthPassword.parse("")).toThrow("basic.auth.password.empty");
  });

  test("rejects too long", () => {
    expect(() => BasicAuthPassword.parse(`${"a".repeat(128)}a`)).toThrow("basic.auth.password.too.long");
  });
});
