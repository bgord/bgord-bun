import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { NonceProviderNoopAdapter } from "../src/nonce-provider-noop.adapter";
import { NonceValue } from "../src//nonce-value.vo";

describe("NonceProviderNoopAdapter", () => {
  test("happy path", () => {
    const adapter = new NonceProviderNoopAdapter();

    const result = adapter.generate();

    expect(result).toEqual(v.parse(NonceValue, "0000000000000000"));
  });
});
