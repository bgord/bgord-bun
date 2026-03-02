import { describe, expect, test } from "bun:test";
import { AbAssignmentFixedStrategy } from "../src/ab-assignment-fixed.strategy";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";
import { AbVariants } from "../src/ab-variants.vo";
import { RequestContextBuilder } from "./request-context-builder";

const control = new AbVariant({ name: "control", weight: AbVariantWeight.parse(50) });
const treatment = new AbVariant({ name: "treatment", weight: AbVariantWeight.parse(50) });
const variants = new AbVariants([control, treatment]);

describe("AbAssignmentFixedStrategy", () => {
  test("happy path", async () => {
    const strategy = new AbAssignmentFixedStrategy(control);
    const context = new RequestContextBuilder().withUserId("user-123").build();

    expect(await strategy.assign(context, variants)).toEqual(control);
  });

  test("ignores context", async () => {
    const strategy = new AbAssignmentFixedStrategy(treatment);
    const context = new RequestContextBuilder().withUserId("user-aaa").build();

    expect(await strategy.assign(context, variants)).toEqual(treatment);
  });
});
