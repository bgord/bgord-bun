import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { WebhookSecret } from "../src/webhook-secret.vo";
import { WebhookSignature } from "../src/webhook-signature.vo";
import { WebhookSignatureCreatorSha256Strategy } from "../src/webhook-signature-creator-sha256.strategy";
import { WebhookVerifierSha256Strategy } from "../src/webhook-verifier-sha256.strategy";

const creator = new WebhookSignatureCreatorSha256Strategy();
const secret = v.parse(WebhookSecret, "test-secret");
const wrongSecret = v.parse(WebhookSecret, "wrong-secret");

const body = "test-body";
const wrongBody = "wrong-body";

const signature = v.parse(WebhookSignature, creator.create(body, secret));
const wrongSignature = v.parse(WebhookSignature, "tooshort");

const verifier = new WebhookVerifierSha256Strategy(secret, creator);

describe("WebhookVerifierSha256Strategy", () => {
  test("verify - true", () => {
    expect(verifier.verify(body, signature)).toEqual(true);
  });

  test("verify - false - secret", () => {
    const signature = v.parse(WebhookSignature, creator.create(body, wrongSecret));

    expect(verifier.verify(body, signature)).toEqual(false);
  });

  test("verify - false - body wrong", () => {
    expect(verifier.verify(wrongBody, signature)).toEqual(false);
  });

  test("verify - false - body empty", () => {
    expect(verifier.verify("", signature)).toEqual(false);
  });

  test("verify - false - length", () => {
    expect(verifier.verify(body, wrongSignature)).toEqual(false);
  });
});
