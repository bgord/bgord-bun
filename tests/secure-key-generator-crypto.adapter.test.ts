import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { SecureKeyGeneratorCryptoAdapter } from "../src/secure-key-generator-crypto.adapter";

describe("SecureKeyGeneratorCryptoAdapter", () => {
  test("happy path", () => {
    const adapter = new SecureKeyGeneratorCryptoAdapter();

    const result = adapter.generate(tools.Int.positive(8));

    expect(result.length).toEqual(8);
    expect(result.toHex().length).toEqual(16);
  });

  test("happy path - above the limit", () => {
    const adapter = new SecureKeyGeneratorCryptoAdapter();
    const bytes = SecureKeyGeneratorCryptoAdapter.MAX_BYTES + 1;

    const result = adapter.generate(tools.Int.positive(bytes));

    expect(result.length).toEqual(bytes);
    expect(result.subarray(SecureKeyGeneratorCryptoAdapter.MAX_BYTES).some(Boolean)).toEqual(true);
  });
});
