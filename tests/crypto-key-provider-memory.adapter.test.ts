import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { CryptoKeyProviderMemoryAdapter } from "../src/crypto-key-provider-memory.adapter";
import { EncryptionKeyValue } from "../src/encryption-key-value.vo";

const HEX = v.parse(EncryptionKeyValue, "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90");

describe("CryptoKeyProviderMemoryAdapter", () => {
  test("happy path", async () => {
    const adapter = new CryptoKeyProviderMemoryAdapter(HEX);

    const result = await adapter.get();

    expect(result).toBeInstanceOf(CryptoKey);
    expect(result.type).toEqual("secret");
    expect(result.algorithm.name).toEqual("AES-GCM");
    expect(result.usages).toEqual(["encrypt", "decrypt"]);
    expect(result.extractable).toEqual(false);
  });
});
