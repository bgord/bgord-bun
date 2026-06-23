import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { AbVariantName } from "../src/ab-variant-name.vo";

describe("AbVariantName", () => {
  test("happy path", () => {
    expect(v.safeParse(AbVariantName, "a".repeat(128)).success).toEqual(true);
    expect(v.safeParse(AbVariantName, "A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(AbVariantName, null)).toThrow("ab.variant.name.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(AbVariantName, 123)).toThrow("ab.variant.name.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(AbVariantName, "")).toThrow("ab.variant.name.empty");
  });

  test("rejects too long", () => {
    expect(() => v.parse(AbVariantName, `${"a".repeat(128)}a`)).toThrow("ab.variant.name.too.long");
  });
});
