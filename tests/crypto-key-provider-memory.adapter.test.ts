import { describe, expect, test } from "bun:test";
import { CryptoKeyProviderMemoryAdapter } from "../src/crypto-key-provider-memory.adapter";
import * as testcase from "./testcases";

const cases = testcase.cryptoKeyProvider();

describe("CryptoKeyProviderMemoryAdapter", () => {
  test(cases.happyPath.name, async () => {
    const adapter = new CryptoKeyProviderMemoryAdapter(cases.happyPath.input);

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
