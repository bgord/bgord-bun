import { describe, expect, test } from "bun:test";
import { NonceProviderNoopAdapter } from "../src/nonce-provider-noop.adapter";
import { NonceValue } from "../src//nonce-value.vo";

describe("NonceProviderNoopAdapter", () => {
  test("happy path", () => {
    const adapter = new NonceProviderNoopAdapter();

    const result = adapter.generate();

    expect(result).toEqual(NonceValue.parse("0000000000000000"));
  });
});
