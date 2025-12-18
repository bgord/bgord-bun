import { describe, expect, test } from "bun:test";
import { Hash } from "../src/hash.vo";
import { HashValue, HashValueError } from "../src/hash-value.vo";

const value = HashValue.parse("0000000000000000000000000000000000000000000000000000000000000000");

describe("Hash VO", () => {
  test("fromValue", () => {
    expect(Hash.fromValue(value).get()).toEqual(value);
    expect(Hash.fromValue(value).get()).toEqual(value);
  });

  test("fromString", () => {
    expect(Hash.fromString("0000000000000000000000000000000000000000000000000000000000000000").get()).toEqual(
      value,
    );
  });

  test("fromString - invalid", () => {
    expect(() => Hash.fromString("xyz").get()).toThrow(HashValueError.InvalidHex);
  });

  test("get", () => {
    expect(Hash.fromValue(value).get()).toEqual(value);
  });

  test("matches - true", () => {
    const first = Hash.fromValue(value);
    const second = Hash.fromValue(value);

    expect(first.matches(second)).toEqual(true);
  });

  test("matches - false", () => {
    const first = Hash.fromValue(value);
    const second = Hash.fromString("1111111111111111111111111111111111111111111111111111111111111111");

    expect(first.matches(second)).toEqual(false);
  });

  test("toString", () => {
    expect(Hash.fromValue(value).toString()).toEqual(value);
  });

  test("toJSON", () => {
    expect(Hash.fromValue(value).toJSON()).toEqual(value);
  });
});
