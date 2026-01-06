import { describe, expect, test } from "bun:test";
import { NonceProviderCryptoAdapter } from "../src/nonce-provider-crypto.adapter";
import { NonceValue } from "../src//nonce-value.vo";

describe("NonceProviderCryptoAdapter", () => {
  test("happy path", () => {
    const adapter = new NonceProviderCryptoAdapter();

    const result = adapter.generate();

    expect(result.length).toEqual(16);
    expect(typeof result).toEqual("string");
    expect(NonceValue.safeParse(result).success).toEqual(true);
  });
});
