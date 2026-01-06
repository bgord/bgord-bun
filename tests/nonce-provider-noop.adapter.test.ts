import { describe, expect, test } from "bun:test";
import { NonceProviderNoopAdapter } from "../src/nonce-provider-noop.adapter";

describe("NonceProviderNoopAdapter", () => {
  test("happy path", () => {
    const adapter = new NonceProviderNoopAdapter();

    const result = adapter.generate();

    expect(result).toEqual("0000000000000000");
  });
});
