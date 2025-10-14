import { describe, expect, test } from "bun:test";
import { BasicAuthPassword, BasicAuthPasswordError } from "../src/basic-auth-password.vo";

describe("BasicAuthPassword", () => {
  test("happy path", () => {
    expect(BasicAuthPassword.safeParse("a".repeat(128)).success).toEqual(true);
    expect(BasicAuthPassword.safeParse("A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => BasicAuthPassword.parse(null)).toThrow(BasicAuthPasswordError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => BasicAuthPassword.parse(123)).toThrow(BasicAuthPasswordError.Type);
  });

  test("rejects empty", () => {
    expect(() => BasicAuthPassword.parse("")).toThrow(BasicAuthPasswordError.Empty);
  });

  test("rejects too long", () => {
    expect(() => BasicAuthPassword.parse(`${"a".repeat(128)}a`)).toThrow(BasicAuthPasswordError.TooLong);
  });
});
