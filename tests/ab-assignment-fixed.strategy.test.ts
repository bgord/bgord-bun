import * as v from "valibot";
import { describe, expect, test } from "bun:test";
import { AbAssignmentFixedStrategy } from "../src/ab-assignment-fixed.strategy";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";
import { AbVariants } from "../src/ab-variants.vo";
import { RequestContextBuilder } from "./request-context-builder";

const control = new AbVariant({ name: "control", weight: v.parse(AbVariantWeight, 50) });
const treatment = new AbVariant({ name: "treatment", weight: v.parse(AbVariantWeight, 50) });

const variants = new AbVariants([control, treatment]);

const strategy = new AbAssignmentFixedStrategy(control);

describe("AbAssignmentFixedStrategy", () => {
  test("happy path", async () => {
    const context = new RequestContextBuilder().withUserId("user-123").build();

    expect(await strategy.assign(context, variants)).toEqual(control);
  });

  test("empty context", async () => {
    const context = new RequestContextBuilder().withUserId(undefined).build();

    expect(await strategy.assign(context, variants)).toEqual(control);
  });
});
