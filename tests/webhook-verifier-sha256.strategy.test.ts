import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { WebhookSecret } from "../src/webhook-secret.vo";
import { WebhookSignature } from "../src/webhook-signature.vo";
import { WebhookSignatureCreatorSha256Strategy } from "../src/webhook-signature-creator-sha256.strategy";
import { WebhookVerifierSha256Strategy } from "../src/webhook-verifier-sha256.strategy";

const secret = v.parse(WebhookSecret, "test-secret");

const body = "test-body";
const wrongBody = "wrong-body";

const WebhookSignatureCreator = new WebhookSignatureCreatorSha256Strategy(secret);
const signature = WebhookSignatureCreator.create(body);
const wrongSignature = v.parse(WebhookSignature, "tooshort");

const verifier = new WebhookVerifierSha256Strategy({ WebhookSignatureCreator });

describe("WebhookVerifierSha256Strategy", () => {
  test("verify - true", () => {
    expect(verifier.verify(body, signature)).toEqual(true);
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
