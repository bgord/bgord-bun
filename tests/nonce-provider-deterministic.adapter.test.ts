import { describe, expect, test } from "bun:test";
import { NonceProviderDeterministicAdapter } from "../src/nonce-provider-deterministic.adapter";
import * as mocks from "./mocks";

describe("NonceProviderDeterministicAdapter", () => {
  test("happy path", () => {
    const provider = new NonceProviderDeterministicAdapter([mocks.nonce, mocks.nonce]);

    expect(provider.generate()).toEqual(mocks.nonce);
    expect(provider.generate()).toEqual(mocks.nonce);
    expect(() => provider.generate()).toThrow("nonce.provider.deterministic.adapter.sequence.exhausted");
  });
});
