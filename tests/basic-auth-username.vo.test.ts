import { describe, expect, test } from "bun:test";
import { BasicAuthUsername } from "../src/basic-auth-username.vo";

describe("BasicAuthUsername VO", () => {
  test("happy path", () => {
    expect(BasicAuthUsername.safeParse("a".repeat(128)).success).toEqual(true);
    expect(BasicAuthUsername.safeParse("A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => BasicAuthUsername.parse(null)).toThrow("basic.auth.username.type");
  });

  test("rejects non-string - number", () => {
    expect(() => BasicAuthUsername.parse(123)).toThrow("basic.auth.username.type");
  });

  test("rejects empty", () => {
    expect(() => BasicAuthUsername.parse("")).toThrow("basic.auth.username.empty");
  });

  test("rejects too long", () => {
    expect(() => BasicAuthUsername.parse(`${"a".repeat(128)}a`)).toThrow("basic.auth.username.too.long");
  });
});
