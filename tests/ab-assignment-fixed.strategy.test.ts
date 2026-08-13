import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { AbAssignmentFixedStrategy } from "../src/ab-assignment-fixed.strategy";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantName } from "../src/ab-variant-name.vo";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const control = new AbVariant({
  name: v.parse(AbVariantName, "control"),
  weight: v.parse(AbVariantWeight, 50),
});

const strategy = new AbAssignmentFixedStrategy(control);

describe("AbAssignmentFixedStrategy", () => {
  test("happy path", async () => {
    const context = new RequestContextBuilder().withUserId(mocks.userId).build();

    expect(await strategy.assign(context)).toEqual(control);
  });

  test("empty context", async () => {
    const context = new RequestContextBuilder().withUserId(undefined).build();

    expect(await strategy.assign(context)).toEqual(control);
  });
});
