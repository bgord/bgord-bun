import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { SecureKeyGeneratorNoopAdapter } from "../src/secure-key-generator-noop.adapter";

describe("SecureKeyGeneratorNoopAdapter", () => {
  test("happy path", () => {
    const adapter = new SecureKeyGeneratorNoopAdapter();

    const result = adapter.generate(tools.Int.positive(1));

    expect(result.length).toEqual(32);
    expect(result.toHex()).toEqual(new TextEncoder().encode("0".repeat(32)).toHex());
  });
});
