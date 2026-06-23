import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantName } from "../src/ab-variant-name.vo";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";
import { AbVariants } from "../src/ab-variants.vo";

const one_fifth = v.parse(AbVariantWeight, 20);
const half = v.parse(AbVariantWeight, 50);

const classic = new AbVariant({ name: v.parse(AbVariantName, "classic"), weight: half });
const old = new AbVariant({ name: v.parse(AbVariantName, "old"), weight: half });

describe("AbVariants", () => {
  test("happy path", () => {
    expect(() => new AbVariants([classic, old])).not.toThrow();
  });

  test("happy path - max variants", () => {
    const first = new AbVariant({ name: v.parse(AbVariantName, "first"), weight: one_fifth });
    const second = new AbVariant({ name: v.parse(AbVariantName, "second"), weight: one_fifth });
    const third = new AbVariant({ name: v.parse(AbVariantName, "third"), weight: one_fifth });
    const fourth = new AbVariant({ name: v.parse(AbVariantName, "fourth"), weight: one_fifth });
    const fifth = new AbVariant({ name: v.parse(AbVariantName, "fifth"), weight: one_fifth });

    expect(() => new AbVariants([first, second, third, fourth, fifth])).not.toThrow();
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
    const low = new AbVariant({ name: v.parse(AbVariantName, "old"), weight: v.parse(AbVariantWeight, 45) });

    expect(() => new AbVariants([classic, low])).toThrow("ab.variants.sum");
  });

  test("sum - too big", () => {
    const high = new AbVariant({ name: v.parse(AbVariantName, "old"), weight: v.parse(AbVariantWeight, 55) });

    expect(() => new AbVariants([classic, high])).toThrow("ab.variants.sum");
  });
});
