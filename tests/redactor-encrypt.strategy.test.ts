import { describe, expect, spyOn, test } from "bun:test";
import { CryptoKeyProviderNoopAdapter } from "../src/crypto-key-provider-noop.adapter";
import { EncryptionIV } from "../src/encryption-iv.vo";
import { RedactorEncryptionStrategy } from "../src/redactor-encrypt.strategy";
import { SealerAesGcmAdapter } from "../src/sealer-aes-gcm.adapter";

const iv = new Uint8Array(Array.from({ length: 12 }, (_, i) => i + 1));

const CryptoKeyProvider = new CryptoKeyProviderNoopAdapter();
const Sealer = new SealerAesGcmAdapter({ CryptoKeyProvider });
const deps = { Sealer };
const adapter = new RedactorEncryptionStrategy("metadata", deps);

const encrypted =
  "sealed:gcm:AQIDBAUGBwgJCgsMRma/R0YdEfjwf4wj2cMB6oz4fNWDzUQHZV7guba4/fcZgltfOxucyofuokH63fh3fBTlV0fj/wm1s7/FgzE2ENf6mg0CVY0Uw6D7c4PGZJYzOJa4";

describe("RedactorEncryptionStrategy", () => {
  test("passthrough - non-object", async () => {
    const result = await adapter.redact(5);

    expect(result).toEqual(5);
  });

  test("passthrough - empty object", async () => {
    const result = await adapter.redact({});

    expect(result).toEqual({});
  });

  test("passthrough - missing key", async () => {
    const result = await adapter.redact({ other: "key" });

    expect(result).toEqual({ other: "key" });
  });

  test("roundtrip", async () => {
    spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    const input = {
      metadata: { headers: { Authorization: "Bearer xyz" }, client: { ip: "1.2.3.4" } },
      keep: 123,
    };

    const result = await adapter.redact(input);

    // @ts-expect-error
    expect(result.metadata).toEqual(encrypted);
    expect(result.keep).toEqual(123);
    expect(input.metadata.client.ip).toEqual("1.2.3.4");

    // @ts-expect-error
    const roundtrip = await Sealer.unseal(result.metadata);

    expect(roundtrip).toEqual(input.metadata);
  });
});
