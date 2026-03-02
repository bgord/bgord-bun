import { describe, expect, test } from "bun:test";
import { AbMiddleware } from "../src/ab.middleware";
import { AbAssignmentCompositeStrategy } from "../src/ab-assignment-composite.strategy";
import { AbAssignmentHashStrategy } from "../src/ab-assignment-hash.strategy";
import { AbAssignmentQueryStrategy } from "../src/ab-assignment-query.strategy";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";
import { AbVariants } from "../src/ab-variants.vo";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const control = new AbVariant({ name: "control", weight: AbVariantWeight.parse(50) });
const treatment = new AbVariant({ name: "treatment", weight: AbVariantWeight.parse(50) });
const variants = new AbVariants([control, treatment]);

const subject = new SubjectRequestResolver(
  [new SubjectSegmentFixedStrategy("test-exp"), new SubjectSegmentUserStrategy()],
  { HashContent: new HashContentSha256Strategy() },
);

const hash = new AbAssignmentHashStrategy(variants, subject);
const query = new AbAssignmentQueryStrategy("ab-variant");

const strategy = new AbAssignmentCompositeStrategy([query, hash]);

const ab = new AbMiddleware(variants, strategy);

describe("AbMiddleware", () => {
  test("happy path", async () => {
    const context = new RequestContextBuilder().withUserId("user-123").build();

    expect(await ab.evaluate(context)).toEqual(control);
  });

  test("query", async () => {
    const context = new RequestContextBuilder()
      .withUserId("user-123")
      .withQuery({ "ab-variant": "treatment" })
      .build();

    expect(await ab.evaluate(context)).toEqual(treatment);
  });

  test("idempotence", async () => {
    const context = new RequestContextBuilder().withUserId("user-456").build();

    expect(await ab.evaluate(context)).toEqual(await ab.evaluate(context));
  });

  test("empty context", async () => {
    const context = new RequestContextBuilder().withUserId(undefined).build();

    expect(await ab.evaluate(context)).toEqual(control);
  });
});
