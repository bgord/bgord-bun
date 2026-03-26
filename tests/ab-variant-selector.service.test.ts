import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantSelector } from "../src/ab-variant-selector.service";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";
import { AbVariants } from "../src/ab-variants.vo";
import { Hash } from "../src/hash.vo";

const control = new AbVariant({ name: "control", weight: v.parse(AbVariantWeight, 50) });
const treatment = new AbVariant({ name: "treatment", weight: v.parse(AbVariantWeight, 50) });

const variants = new AbVariants([control, treatment]);

const a = Hash.fromString("a".repeat(64));
const b = Hash.fromString("b".repeat(64));
const zeros = Hash.fromString("0".repeat(64));
const f = Hash.fromString("f".repeat(64));

const selector = new AbVariantSelector(variants);

describe("AbVariantSelector", () => {
  test("happy path", () => {
    expect([control, treatment]).toContain(selector.select(a));
  });

  test("idempotence", () => {
    expect(selector.select(b)).toEqual(selector.select(b));
  });

  test("all zeros", () => {
    expect(selector.select(zeros)).toEqual(control);
  });

  test("uneven split", () => {
    const majority = new AbVariant({ name: "majority", weight: v.parse(AbVariantWeight, 90) });
    const minority = new AbVariant({ name: "minority", weight: v.parse(AbVariantWeight, 10) });
    const selector = new AbVariantSelector(new AbVariants([majority, minority]));

    expect(selector.select(zeros)).toEqual(majority);
    expect(selector.select(f)).toEqual(minority);
  });

  test("middle boundary", () => {
    const hash49 = Hash.fromString(`00000031${"0".repeat(56)}`);
    const hash50 = Hash.fromString(`00000032${"0".repeat(56)}`);

    expect(selector.select(hash49)).toEqual(control);
    expect(selector.select(hash50)).toEqual(treatment);
  });

  test("three variants", () => {
    const variantA = new AbVariant({ name: "a", weight: v.parse(AbVariantWeight, 33) });
    const variantB = new AbVariant({ name: "b", weight: v.parse(AbVariantWeight, 33) });
    const variantC = new AbVariant({ name: "c", weight: v.parse(AbVariantWeight, 34) });
    const selector = new AbVariantSelector(new AbVariants([variantA, variantB, variantC]));

    const selected = selector.select(a);

    expect([variantA, variantB, variantC]).toContain(selected);
  });
});
