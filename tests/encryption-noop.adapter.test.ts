import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { EncryptionNoopAdapter } from "../src/encryption-noop.adapter";

const text = "noop";
const decrypted = new TextEncoder().encode(text).buffer;

const recipe = {
  input: tools.FilePathAbsolute.fromString("/tmp/in.bin"),
  output: tools.FilePathAbsolute.fromString("/tmp/out.bin"),
};

const adapter = new EncryptionNoopAdapter();

describe("EncryptionBunAdapter", () => {
  test("encrypt", async () => {
    expect(await adapter.encrypt(recipe)).toEqual(recipe.output);
  });

  test("decrypt", async () => {
    expect(await adapter.decrypt(recipe)).toEqual(recipe.output);
  });

  test("view", async () => {
    const result = await adapter.view(recipe.input);

    expect(result).toEqual(decrypted);
  });
});
