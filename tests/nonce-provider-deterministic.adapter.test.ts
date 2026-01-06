import { describe, expect, test } from "bun:test";
import { NonceProviderDeterministicAdapter } from "../src/nonce-provider-deterministic.adapter";
import { NonceValue } from "../src/nonce-value.vo";

const zeros = NonceValue.parse("0000000000000000");
const ones = NonceValue.parse("1111111111111111");

describe("NonceProviderDeterministicAdapter", () => {
  test("happy path", () => {
    const provider = new NonceProviderDeterministicAdapter([zeros, ones]);

    expect(provider.generate()).toEqual(zeros);
    expect(provider.generate()).toEqual(ones);
    expect(() => provider.generate()).toThrow("nonce.provider.deterministic.adapter.sequence.exhausted");
  });
});
