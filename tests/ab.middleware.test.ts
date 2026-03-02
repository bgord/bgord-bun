import { describe, expect, test } from "bun:test";
import { AbMiddleware } from "../src/ab.middleware";
import { AbAssignmentHashStrategy } from "../src/ab-assignment-hash.strategy";
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

const assignmentStrategy = new AbAssignmentHashStrategy(variants, subject);
const middleware = new AbMiddleware(variants, assignmentStrategy);

describe("AbMiddleware", () => {
  test("happy path", async () => {
    const context = new RequestContextBuilder().withUserId("user-123").build();
    const variant = await middleware.evaluate(context);

    expect(variant).toEqual(control);
  });

  test("idempotence", async () => {
    const context = new RequestContextBuilder().withUserId("user-456").build();

    expect(await middleware.evaluate(context)).toEqual(await middleware.evaluate(context));
  });

  test("empty context", async () => {
    const context = new RequestContextBuilder().withUserId(undefined).build();

    expect(await middleware.evaluate(context)).toEqual(control);
  });
});
