import { describe, expect, test } from "bun:test";
import { NonceProviderNoopAdapter } from "../src/nonce-provider-noop.adapter";
import * as mocks from "./mocks";

describe("NonceProviderNoopAdapter", () => {
  test("happy path", () => {
    const adapter = new NonceProviderNoopAdapter();

    const result = adapter.generate();

    expect(result).toEqual(mocks.nonce);
  });
});
