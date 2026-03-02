import { describe, expect, test } from "bun:test";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";

describe("AbVariantWeight", () => {
  test("happy path", () => {
    expect(AbVariantWeight.safeParse(1).success).toEqual(true);
    expect(AbVariantWeight.safeParse(99).success).toEqual(true);
  });

  test("rejects non-number - null", () => {
    expect(() => AbVariantWeight.parse(null)).toThrow("ab.variant.weight.min.max");
  });

  test("rejects non-number - string", () => {
    expect(() => AbVariantWeight.parse("123")).toThrow("ab.variant.weight.min.max");
  });

  test("rejects too small", () => {
    expect(() => AbVariantWeight.parse(0)).toThrow("ab.variant.weight.min.max");
  });

  test("rejects too big", () => {
    expect(() => AbVariantWeight.parse(100)).toThrow("ab.variant.weight.min.max");
  });
});
