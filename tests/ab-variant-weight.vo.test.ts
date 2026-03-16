import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";

describe("AbVariantWeight", () => {
  test("happy path", () => {
    expect(v.safeParse(AbVariantWeight, 1).success).toEqual(true);
    expect(v.safeParse(AbVariantWeight, 99).success).toEqual(true);
  });

  test("rejects non-number - null", () => {
    expect(() => v.parse(AbVariantWeight, null)).toThrow("ab.variant.weight.min.max");
  });

  test("rejects non-number - string", () => {
    expect(() => v.parse(AbVariantWeight, "123")).toThrow("ab.variant.weight.min.max");
  });

  test("rejects too small", () => {
    expect(() => v.parse(AbVariantWeight, 0)).toThrow("ab.variant.weight.min.max");
  });

  test("rejects too big", () => {
    expect(() => v.parse(AbVariantWeight, 100)).toThrow("ab.variant.weight.min.max");
  });
});
