import { describe, expect, test } from "bun:test";
import { SecureKeyGeneratorNoopAdapter } from "../src/secure-key-generator-noop.adapter";

describe("SecureKeyGeneratorNoopAdapter", () => {
  test("happy path", () => {
    const adapter = new SecureKeyGeneratorNoopAdapter();

    const result = adapter.generate();

    expect(result.length).toEqual(4);
    expect(result.toHex()).toEqual(new TextEncoder().encode("noop").toHex());
  });
});
