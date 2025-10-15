import { describe, expect, test } from "bun:test";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";

describe("IdProviderCryptoAdapter", () => {
  test("happy path", () => {
    expect(typeof new IdProviderCryptoAdapter().generate()).toEqual("string");
  });
});
