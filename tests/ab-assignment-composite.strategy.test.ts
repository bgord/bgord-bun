import { describe, expect, test } from "bun:test";
import { AbAssignmentCompositeStrategy } from "../src/ab-assignment-composite.strategy";
import { AbAssignmentFixedStrategy } from "../src/ab-assignment-fixed.strategy";
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

const query = new AbAssignmentQueryStrategy("ab-variant");
const fixed = new AbAssignmentFixedStrategy(treatment);
const hash = new AbAssignmentHashStrategy(variants, subject);

describe("AbAssignmentCompositeStrategy", () => {
  test("happy path - first", async () => {
    const context = new RequestContextBuilder().withUserId("user-123").build();
    const strategy = new AbAssignmentCompositeStrategy([fixed, hash]);

    expect(await strategy.assign(context, variants)).toEqual(treatment);
  });

  test("happy path - second", async () => {
    const context = new RequestContextBuilder().withUserId("user-123").build();
    const strategy = new AbAssignmentCompositeStrategy([query, hash]);

    expect(await strategy.assign(context, variants)).toEqual(control);
  });

  test("happy path - query", async () => {
    const context = new RequestContextBuilder()
      .withUserId("user-123")
      .withQuery({ "ab-variant": "treatment" })
      .build();
    const strategy = new AbAssignmentCompositeStrategy([query, hash]);

    expect(await strategy.assign(context, variants)).toEqual(treatment);
  });

  test("undefined", async () => {
    const context = new RequestContextBuilder().build();
    const composite = new AbAssignmentCompositeStrategy([query]);

    expect(await composite.assign(context, variants)).toEqual(undefined);
  });
});
