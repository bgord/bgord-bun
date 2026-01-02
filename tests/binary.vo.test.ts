import { describe, expect, test } from "bun:test";
import { Binary } from "../src/binary.vo";

describe("Binary VO", () => {
  test("happy path", () => {
    expect(Binary.safeParse("a".repeat(64)).success).toEqual(true);
    expect(Binary.safeParse("A".repeat(64)).success).toEqual(true);
    expect(Binary.safeParse("a_beta").success).toEqual(true);
    expect(Binary.safeParse("a-beta").success).toEqual(true);
    expect(Binary.safeParse("a2").success).toEqual(true);
  });

  test("rejects prefix", () => {
    expect(() => Binary.parse("!a")).toThrow("binary.bad.chars");
  });

  test("rejects non-string - null", () => {
    expect(() => Binary.parse(null)).toThrow("binary.type");
  });

  test("rejects non-string - number", () => {
    expect(() => Binary.parse(123)).toThrow("binary.type");
  });

  test("rejects empty", () => {
    expect(() => Binary.parse("")).toThrow("binary.empty");
  });

  test("rejects too long", () => {
    expect(() => Binary.parse(`${"a".repeat(64)}abc`)).toThrow("binary.too.long");
  });

  test("rejects bad chars", () => {
    expect(() => Binary.parse(`${"a".repeat(63)}!`)).toThrow("binary.bad.chars");
  });
});
