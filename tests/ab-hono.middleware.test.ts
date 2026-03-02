import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { AbAssignmentCompositeStrategy } from "../src/ab-assignment-composite.strategy";
import { AbAssignmentHashStrategy } from "../src/ab-assignment-hash.strategy";
import { AbAssignmentQueryStrategy } from "../src/ab-assignment-query.strategy";
import { AbHonoMiddleware, type AbVariables } from "../src/ab-hono.middleware";
import { AbVariant } from "../src/ab-variant.vo";
import { AbVariantWeight } from "../src/ab-variant-weight.vo";
import { AbVariants } from "../src/ab-variants.vo";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";

type Config = { Variables: AbVariables };

const control = new AbVariant({ name: "control", weight: AbVariantWeight.parse(50) });
const treatment = new AbVariant({ name: "treatment", weight: AbVariantWeight.parse(50) });
const variants = new AbVariants([control, treatment]);

const subject = new SubjectRequestResolver(
  [new SubjectSegmentFixedStrategy("test-exp"), new SubjectSegmentUserStrategy()],
  { HashContent: new HashContentSha256Strategy() },
);

const hash = new AbAssignmentHashStrategy(variants, subject);
const query = new AbAssignmentQueryStrategy("ab-variant");

const app = new Hono<Config>()
  .use(new AbHonoMiddleware(variants, hash).handle())
  .get("/test", (c) => c.text(c.get("abVariant")?.config.name ?? "unknown"));

describe("AbHonoMiddleware", () => {
  test("happy path", async () => {
    const response = await app.request("/test");

    expect(await response.text()).toEqual(control.config.name);
  });

  test("query", async () => {
    const strategy = new AbAssignmentCompositeStrategy([query, hash]);

    const app = new Hono<Config>()
      .use(new AbHonoMiddleware(variants, strategy).handle())
      .get("/test", (c) => c.text(c.get("abVariant")?.config.name ?? "unknown"));

    const response = await app.request("/test?ab-variant=treatment");

    expect(await response.text()).toEqual(treatment.config.name);
  });

  test("idempotence", async () => {
    const first = await app.request("/test", { headers: { Cookie: "session=user-123" } });
    const second = await app.request("/test", { headers: { Cookie: "session=user-123" } });

    expect(await first.text()).toEqual(await second.text());
  });

  test("empty context", async () => {
    const response = await app.request("/test");

    expect(await response.text()).toEqual(control.config.name);
  });
});
