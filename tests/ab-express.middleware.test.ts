import { describe, expect, test } from "bun:test";
import express from "express";
import request from "supertest";
import { AbAssignmentCompositeStrategy } from "../src/ab-assignment-composite.strategy";
import { AbAssignmentHashStrategy } from "../src/ab-assignment-hash.strategy";
import { AbAssignmentQueryStrategy } from "../src/ab-assignment-query.strategy";
import { AbExpressMiddleware } from "../src/ab-express.middleware";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";
import { AbVariants } from "../src/ab-variants.vo";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";

const control = new AbVariant({ name: "control", weight: AbVariantWeight.parse(50) });
const treatment = new AbVariant({ name: "treatment", weight: AbVariantWeight.parse(50) });
const variants = new AbVariants([control, treatment]);

const subject = new SubjectRequestResolver(
  [new SubjectSegmentFixedStrategy("test-exp"), new SubjectSegmentUserStrategy()],
  { HashContent: new HashContentSha256Strategy() },
);

const hash = new AbAssignmentHashStrategy(variants, subject);
const query = new AbAssignmentQueryStrategy("ab-variant");

const app = express()
  .use(new AbExpressMiddleware(variants, hash).handle())
  .get("/test", (req, res) => res.send(req.abVariant?.config.name ?? "unknown"));

describe("AbExpressMiddleware", () => {
  test("happy path", async () => {
    const response = await request(app).get("/test");

    expect(response.text).toEqual(control.config.name);
  });

  test("query", async () => {
    const strategy = new AbAssignmentCompositeStrategy([query, hash]);

    const app = express()
      .use(new AbExpressMiddleware(variants, strategy).handle())
      .get("/test", (req, res) => res.send(req.abVariant?.config.name ?? "unknown"));

    const response = await request(app).get("/test?ab-variant=treatment");

    expect(response.text).toEqual(treatment.config.name);
  });

  test("idempotence", async () => {
    const first = await request(app).get("/test").set("cookie", "session=user-123");
    const second = await request(app).get("/test").set("cookie", "session=user-123");

    expect(first.text).toEqual(second.text);
  });

  test("empty context", async () => {
    const response = await request(app).get("/test");

    expect(response.text).toEqual(control.config.name);
  });
});
