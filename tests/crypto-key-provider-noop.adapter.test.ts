import { describe, expect, test } from "bun:test";
import { CryptoKeyProviderNoopAdapter } from "../src/crypto-key-provider-noop.adapter";

const adapter = new CryptoKeyProviderNoopAdapter();

describe("CryptoKeyProviderNoopAdapter", () => {
  test("happy path", async () => {
    const result = await adapter.get();

    expect(result).toBeInstanceOf(CryptoKey);
    expect(result.algorithm.name).toBe("AES-GCM");
    expect(result.usages).toEqual(["decrypt", "encrypt"]);
    expect(result.extractable).toBe(false);
  });
});
