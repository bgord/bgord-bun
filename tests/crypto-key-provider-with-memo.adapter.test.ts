import { describe, expect, spyOn, test } from "bun:test";
import * as v from "valibot";
import { CryptoKeyProviderMemoryAdapter } from "../src/crypto-key-provider-memory.adapter";
import { CryptoKeyProviderWithMemoAdapter } from "../src/crypto-key-provider-with-memo.adapter";
import { EncryptionKeyValue } from "../src/encryption-key-value.vo";

const HEX = v.parse(
  EncryptionKeyValue,
  "000102030405060708090a0b0c0d0e0f" + "000102030405060708090a0b0c0d0e0f",
);

describe("CryptoKeyProviderWithMemoAdapter", () => {
  test("happy path", async () => {
    const inner = new CryptoKeyProviderMemoryAdapter(HEX);
    using innerGet = spyOn(inner, "get");
    const adapter = new CryptoKeyProviderWithMemoAdapter({ inner });

    const result = await adapter.get();

    expect(result.type).toEqual("secret");
    expect(result).toBe(await adapter.get());
    expect(innerGet).toHaveBeenCalledTimes(1);
  });
});
