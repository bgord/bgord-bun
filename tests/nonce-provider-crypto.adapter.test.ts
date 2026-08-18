import { describe, expect, spyOn, test } from "bun:test";
import * as v from "valibot";
import { NonceProviderCryptoAdapter } from "../src/nonce-provider-crypto.adapter";
import { NonceValue } from "../src/nonce-value.vo";

describe("NonceProviderCryptoAdapter", () => {
  test("generate", () => {
    using getRandomValues = spyOn(crypto, "getRandomValues").mockImplementation((buffer: Uint8Array) => {
      buffer.fill(0xab);
      return buffer;
    });
    const adapter = new NonceProviderCryptoAdapter();

    const result = adapter.generate();

    expect(result).toEqual(v.parse(NonceValue, "ab".repeat(16)));
    expect(v.safeParse(NonceValue, result).success).toEqual(true);
    expect(getRandomValues).toHaveBeenCalled();
  });
});
