import { describe, expect, spyOn, test } from "bun:test";
import { CryptoKeyProviderMemoryAdapter } from "../src/crypto-key-provider-memory.adapter";
import { CryptoKeyProviderWithMemoAdapter } from "../src/crypto-key-provider-with-memo.adapter";
import * as testcase from "./testcases";

const cases = testcase.cryptoKeyProvider();

describe("CryptoKeyProviderWithMemoAdapter", () => {
  test(cases.happyPath.name, async () => {
    const inner = new CryptoKeyProviderMemoryAdapter(cases.happyPath.input);
    using innerGet = spyOn(inner, "get");
    const adapter = new CryptoKeyProviderWithMemoAdapter({ inner });

    const result = await adapter.get();

    expect(result).toBeInstanceOf(CryptoKey);
    expect({
      type: result.type,
      algorithm: result.algorithm,
      usages: result.usages,
      extractable: result.extractable,
    }).toEqual(cases.happyPath.output);

    expect(result).toBe(await adapter.get());
    expect(innerGet).toHaveBeenCalledTimes(1);
  });
});
