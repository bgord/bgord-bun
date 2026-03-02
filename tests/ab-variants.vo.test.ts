import { describe, expect, test } from "bun:test";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";
import { AbVariants } from "../src/ab-variants.vo";

const classic = new AbVariant({ name: "classic", weight: AbVariantWeight.parse(50) });
const old = new AbVariant({ name: "old", weight: AbVariantWeight.parse(50) });

describe("AbVariants", () => {
  test("happy path", () => {
    expect(() => new AbVariants([classic, old])).not.toThrow();
  });

  test("no variants", () => {
    expect(() => new AbVariants([])).toThrow("ab.variants.min");
  });

  test("one variant", () => {
    expect(() => new AbVariants([classic])).toThrow("ab.variants.min");
  });

  test("too much variants", () => {
    expect(() => new AbVariants([classic, classic, classic, classic, classic, classic])).toThrow(
      "ab.variants.max",
    );
  });

  test("unique names", () => {
    expect(() => new AbVariants([classic, classic])).toThrow("ab.variants.unique.names");
  });

  test("sum - too low", () => {
    const low = new AbVariant({ name: "old", weight: AbVariantWeight.parse(45) });

    expect(() => new AbVariants([classic, low])).toThrow("ab.variants.sum");
  });

  test("sum - too big", () => {
    const high = new AbVariant({ name: "old", weight: AbVariantWeight.parse(55) });

    expect(() => new AbVariants([classic, high])).toThrow("ab.variants.sum");
  });
});
