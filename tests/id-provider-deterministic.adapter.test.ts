import { describe, expect, test } from "bun:test";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import * as mocks from "./mocks";

describe("IdProviderDeterministicAdapter", () => {
  test("happy path", () => {
    const provider = new IdProviderDeterministicAdapter([mocks.firstId, mocks.secondId]);

    expect(provider.generate()).toEqual(mocks.firstId);
    expect(provider.generate()).toEqual(mocks.secondId);
    expect(() => provider.generate()).toThrow("id.provider.deterministic.adapter.sequence.exhausted");
  });
});
