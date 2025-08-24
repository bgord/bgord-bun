import { describe, expect, test } from "bun:test";
import { LogSimplifier } from "../src/logger-simplify.service";

describe("LogSimplifier.simplify", () => {
  test("keeps primitives unchanged", () => {
    expect(LogSimplifier.simplify(42)).toBe(42);
    expect(LogSimplifier.simplify("x")).toBe("x");
    expect(LogSimplifier.simplify(false)).toBe(false);
    expect(LogSimplifier.simplify(null)).toBe(null);
    expect(LogSimplifier.simplify(undefined)).toBeUndefined();
  });

  test("summarizes arrays", () => {
    expect(LogSimplifier.simplify([1, 2, 3])).toEqual({ type: "Array", length: 3 });
    expect(LogSimplifier.simplify([])).toEqual({ type: "Array", length: 0 });
  });

  test("summarizes nested arrays inside objects", () => {
    const out = LogSimplifier.simplify({ a: [1, 2], b: { c: [3] } });
    expect(out).toEqual({
      a: { type: "Array", length: 2 },
      b: { c: { type: "Array", length: 1 } },
    });
  });
});
