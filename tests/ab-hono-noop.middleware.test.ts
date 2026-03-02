import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import type { AbVariables } from "../src/ab-hono.middleware";
import { AbHonoNoopMiddleware } from "../src/ab-hono-noop.middleware";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";

const control = new AbVariant({ name: "control", weight: AbVariantWeight.parse(50) });
const ab = new AbHonoNoopMiddleware(control).handle();

describe("AbHonoNoopMiddleware", () => {
  test("happy path", async () => {
    const app = new Hono<{ Variables: AbVariables }>()
      .use(ab)
      .get("/test", (c) => c.json({ variant: c.get("abVariant").config.name }));

    const response = await app.request("/test");
    const json = await response.json();

    expect(json.variant).toEqual("control");
  });
});
