import { describe, expect, test } from "bun:test";
import { CryptoKeyProviderNoopAdapter } from "../src/crypto-key-provider-noop.adapter";
import * as testcase from "./testcases";

const cases = testcase.cryptoKeyProvider();

const adapter = new CryptoKeyProviderNoopAdapter();

describe("CryptoKeyProviderNoopAdapter", () => {
  test(cases.happyPath.name, async () => {
    const result = await adapter.get();

    expect(result).toBeInstanceOf(CryptoKey);
    expect({
      type: result.type,
      algorithm: result.algorithm,
      usages: result.usages,
      extractable: result.extractable,
    }).toEqual(cases.happyPath.output);
  });
});
