import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import type { AbVariables } from "../src/ab-hono.middleware";
import { AbHonoNoopMiddleware } from "../src/ab-hono-noop.middleware";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";
import { AbVariants } from "../src/ab-variants.vo";

const control = new AbVariant({ name: "control", weight: AbVariantWeight.parse(50) });
const treatment = new AbVariant({ name: "treatment", weight: AbVariantWeight.parse(50) });
const variants = new AbVariants([control, treatment]);

const ab = new AbHonoNoopMiddleware(variants, control).handle();

describe("AbHonoNoopMiddleware", () => {
  test("happy path", async () => {
    const app = new Hono<{ Variables: AbVariables }>()
      .use(ab)
      .get("/test", (c) => c.text(c.get("abVariant").config.name));

    const response = await app.request("/test");

    expect(await response.text()).toEqual("control");
  });
});
