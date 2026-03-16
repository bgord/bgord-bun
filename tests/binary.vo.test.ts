import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { Binary } from "../src/binary.vo";

describe("Binary", () => {
  test("happy path", () => {
    expect(v.safeParse(Binary, "a".repeat(64)).success).toEqual(true);
    expect(v.safeParse(Binary, "A".repeat(64)).success).toEqual(true);
    expect(v.safeParse(Binary, "a_beta").success).toEqual(true);
    expect(v.safeParse(Binary, "a-beta").success).toEqual(true);
    expect(v.safeParse(Binary, "a2").success).toEqual(true);
  });

  test("rejects prefix", () => {
    expect(() => v.parse(Binary, "!a")).toThrow("binary.bad.chars");
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(Binary, null)).toThrow("binary.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(Binary, 123)).toThrow("binary.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(Binary, "")).toThrow("binary.empty");
  });

  test("rejects too long", () => {
    expect(() => v.parse(Binary, `${"a".repeat(64)}abc`)).toThrow("binary.too.long");
  });

  test("rejects bad chars", () => {
    expect(() => v.parse(Binary, `${"a".repeat(63)}!`)).toThrow("binary.bad.chars");
  });
});
