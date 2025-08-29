import { describe, expect, test } from "bun:test";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";

const provider = new IdProviderCryptoAdapter();

describe("IdProviderCryptoAdapter", () => {
  test("works", () => {
    expect(provider.generate()).toBeString();
  });
});
