import { describe, expect, test } from "bun:test";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";

const provider = new IdProviderDeterministicAdapter(["123", "234"]);

describe("IdProviderDeterministicAdapter", () => {
  test("works", () => {
    expect(provider.generate()).toEqual("123");
    expect(provider.generate()).toEqual("234");
    expect(() => provider.generate()).toThrow("IdProviderDeterministicAdapter: sequence exhausted");
  });
});
