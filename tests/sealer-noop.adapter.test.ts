import { describe, expect, test } from "bun:test";
import { SealerNoopAdapter } from "../src/sealer-noop.adapter";

const adapter = new SealerNoopAdapter();

const input = { name: "John", age: 42 };
const output = 'sealed:{"name":"John","age":42}';

describe("SealerNoopAdapter", () => {
  test("seal", async () => {
    const result = await adapter.seal(input);

    expect(result).toEqual(output);
  });

  test("unseal", async () => {
    const result = await adapter.unseal(output);

    expect(result).toEqual(input);
  });
});
