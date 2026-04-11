import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { WebhookSecret } from "../src/webhook-secret.vo";
import { WebhookSignature } from "../src/webhook-signature.vo";
import { WebhookSignatureCreatorSha256Strategy } from "../src/webhook-signature-creator-sha256.strategy";

const secret = v.parse(WebhookSecret, "test-secret");
const signature = v.parse(
  WebhookSignature,
  "aa68f94a0d88c41dbfab24b262f5d213ba166f42c233d5ff1eb2b3848e3d6050",
);
const body = "test-body";

const creator = new WebhookSignatureCreatorSha256Strategy(secret);

describe("WebhookSignatureCreatorSha256Strategy", () => {
  test("happy path", () => {
    expect(creator.create(body)).toEqual(signature);
  });

  test("roundtrip", () => {
    expect(creator.create(body)).toEqual(creator.create(body));
  });

  test("returns a different digest for a different secret", () => {
    const other = v.parse(WebhookSecret, "other-secret");

    expect(creator.create(body)).not.toEqual(new WebhookSignatureCreatorSha256Strategy(other).create(body));
  });
});
