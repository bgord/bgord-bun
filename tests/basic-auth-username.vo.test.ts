import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { BasicAuthUsername } from "../src/basic-auth-username.vo";

describe("BasicAuthUsername", () => {
  test("happy path", () => {
    expect(v.safeParse(BasicAuthUsername, "a".repeat(128)).success).toEqual(true);
    expect(v.safeParse(BasicAuthUsername, "A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(BasicAuthUsername, null)).toThrow("basic.auth.username.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(BasicAuthUsername, 123)).toThrow("basic.auth.username.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(BasicAuthUsername, "")).toThrow("basic.auth.username.empty");
  });

  test("rejects too long", () => {
    expect(() => v.parse(BasicAuthUsername, `${"a".repeat(128)}a`)).toThrow("basic.auth.username.too.long");
  });
});
