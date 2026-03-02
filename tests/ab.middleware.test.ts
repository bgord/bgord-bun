import { describe, expect, test } from "bun:test";
import { AbMiddleware } from "../src/ab.middleware";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantSelector } from "../src/ab-variant-selector.service";
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

const config = { name: "test-experiment", variants, subject };

const selector = new AbVariantSelector(variants);
const middleware = new AbMiddleware(selector, config);

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
