import { describe, expect, test } from "bun:test";
import {
  IdProviderDeterministicAdapter,
  IdProviderDeterministicAdapterError,
} from "../src/id-provider-deterministic.adapter";

describe("IdProviderDeterministicAdapter", () => {
  test("happy path", () => {
    const provider = new IdProviderDeterministicAdapter(["123", "234"]);

    expect(provider.generate()).toEqual("123");
    expect(provider.generate()).toEqual("234");
    expect(() => provider.generate()).toThrow(IdProviderDeterministicAdapterError.SequenceExhausted);
  });
});
