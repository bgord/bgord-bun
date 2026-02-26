import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { SecureKeyGeneratorCryptoAdapter } from "../src/secure-key-generator-crypto.adapter";

describe("SecureKeyGeneratorCryptoAdapter", () => {
  test("happy path", () => {
    const adapter = new SecureKeyGeneratorCryptoAdapter();

    const result = adapter.generate(tools.IntegerPositive.parse(8));

    expect(result.length).toEqual(8);
    expect(result.toHex().length).toEqual(16);
  });
});
