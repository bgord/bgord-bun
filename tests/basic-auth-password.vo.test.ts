import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { BasicAuthPassword } from "../src/basic-auth-password.vo";

describe("BasicAuthPassword", () => {
  test("happy path", () => {
    expect(v.safeParse(BasicAuthPassword, "a".repeat(128)).success).toEqual(true);
    expect(v.safeParse(BasicAuthPassword, "A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(BasicAuthPassword, null)).toThrow("basic.auth.password.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(BasicAuthPassword, 123)).toThrow("basic.auth.password.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(BasicAuthPassword, "")).toThrow("basic.auth.password.empty");
  });

  test("rejects too long", () => {
    expect(() => v.parse(BasicAuthPassword, `${"a".repeat(128)}a`)).toThrow("basic.auth.password.too.long");
  });
});
