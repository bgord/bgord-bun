import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { AbAssignmentCookieStrategy } from "../src/ab-assignment-cookie.strategy";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";
import { AbVariants } from "../src/ab-variants.vo";
import { RequestContextBuilder } from "./request-context-builder";

const control = new AbVariant({ name: "control", weight: v.parse(AbVariantWeight, 50) });
const treatment = new AbVariant({ name: "treatment", weight: v.parse(AbVariantWeight, 50) });
const variants = new AbVariants([control, treatment]);

const strategy = new AbAssignmentCookieStrategy("ab-override");

describe("AbAssignmentCookieStrategy", () => {
  test("happy path", async () => {
    const context = new RequestContextBuilder().withCookie("ab-override", "treatment").build();

    expect(await strategy.assign(context, variants)).toEqual(treatment);
  });

  test("unknown variant", async () => {
    const context = new RequestContextBuilder().withCookie("ab-override", "unknown").build();

    expect(await strategy.assign(context, variants)).toEqual(undefined);
  });

  test("no cookie", async () => {
    const context = new RequestContextBuilder().build();

    expect(await strategy.assign(context, variants)).toEqual(undefined);
  });
});
