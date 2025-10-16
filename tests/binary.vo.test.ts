import { describe, expect, test } from "bun:test";
import { Binary, BinaryError } from "../src/binary.vo";

describe("Binary VO", () => {
  test("happy path", () => {
    expect(Binary.safeParse("a".repeat(64)).success).toEqual(true);
    expect(Binary.safeParse("A".repeat(64)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => Binary.parse(null)).toThrow(BinaryError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => Binary.parse(123)).toThrow(BinaryError.Type);
  });

  test("rejects empty", () => {
    expect(() => Binary.parse("")).toThrow(BinaryError.Empty);
  });

  test("rejects too long", () => {
    expect(() => Binary.parse(`${"a".repeat(64)}abc`)).toThrow(BinaryError.TooLong);
  });

  test("rejects bad chars", () => {
    expect(() => Binary.parse(`${"a".repeat(63)}!`)).toThrow(BinaryError.BadChars);
  });
});
