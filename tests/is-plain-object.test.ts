import { describe, expect, test } from "bun:test";
import { isPlainObject } from "../src/is-plain-object";

describe("isPlainObject", () => {
  test("true - object", () => {
    expect(isPlainObject({})).toEqual(true);
  });

  test("true - object null prototype", () => {
    expect(isPlainObject(Object.create(null))).toEqual(true);
  });

  test("false - null", () => {
    expect(isPlainObject(null)).toEqual(false);
  });

  test("false - undefined", () => {
    expect(isPlainObject(undefined)).toEqual(false);
  });

  test("false - array", () => {
    expect(isPlainObject([])).toEqual(false);
  });

  test("false - class", () => {
    class Test {}

    expect(isPlainObject(new Test())).toEqual(false);
  });

  test("false - primitives", () => {
    expect(isPlainObject("x")).toEqual(false);
    expect(isPlainObject(123)).toEqual(false);
    expect(isPlainObject(true)).toEqual(false);
  });
});
