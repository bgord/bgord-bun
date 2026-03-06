import { describe, expect, test } from "bun:test";
import express from "express";
import request from "supertest";
import "../src/ab-express.middleware";
import { AbExpressNoopMiddleware } from "../src/ab-express-noop.middleware";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";
import { AbVariants } from "../src/ab-variants.vo";

const control = new AbVariant({ name: "control", weight: AbVariantWeight.parse(50) });
const treatment = new AbVariant({ name: "treatment", weight: AbVariantWeight.parse(50) });
const variants = new AbVariants([control, treatment]);

const app = express()
  .use(new AbExpressNoopMiddleware(variants, control).handle())
  .get("/test", (req, res) => res.send(req.abVariant?.config.name ?? "unknown"));

describe("AbExpressNoopMiddleware", () => {
  test("happy path", async () => {
    const response = await request(app).get("/test");

    expect(response.text).toEqual("control");
  });
});
