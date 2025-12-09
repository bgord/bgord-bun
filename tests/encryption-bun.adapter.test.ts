import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CryptoKeyProviderNoopAdapter } from "../src/crypto-key-provider-noop.adapter";
import { EncryptionBunAdapter, EncryptionBunAdapterError } from "../src/encryption-bun.adapter";
import { EncryptionIV } from "../src/encryption-iv.vo";

const iv = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
const plaintext = new Uint8Array([10, 20, 30, 40, 50]);
const ciphertext = new Uint8Array([201, 202, 203, 204, 205, 206]);

const encrypted = new Uint8Array(iv.length + ciphertext.length);
encrypted.set(iv, 0);
encrypted.set(ciphertext, iv.length);

const recipe = {
  input: tools.FilePathAbsolute.fromString("/tmp/in.bin"),
  output: tools.FilePathAbsolute.fromString("/tmp/out.bin"),
};

const CryptoKeyProvider = new CryptoKeyProviderNoopAdapter();
const deps = { CryptoKeyProvider };

const adapter = new EncryptionBunAdapter(deps);

describe("EncryptionBunAdapter", () => {
  test("encrypt", async () => {
    spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => plaintext.buffer } as any);
    spyOn(crypto.subtle, "encrypt").mockResolvedValue(ciphertext.buffer);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    const result = await adapter.encrypt(recipe);

    expect(result).toEqual(recipe.output);

    const expected = new Uint8Array(iv.length + ciphertext.length);
    expected.set(iv, 0);
    expected.set(ciphertext, iv.length);

    expect(new Uint8Array(bunWrite.mock.calls[0]?.[1] as any)).toEqual(expected);
  });

  test("decrypt", async () => {
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => encrypted.buffer } as any);
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    const result = await adapter.decrypt(recipe);

    expect(result).toEqual(recipe.output);
    expect(new Uint8Array(bunWrite.mock.calls[0]?.[1] as any)).toEqual(plaintext);
  });

  test("view", async () => {
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => encrypted.buffer } as any);
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);

    const result = await adapter.decrypt(recipe);

    expect(result).toEqual(recipe.output);
  });

  test("invalid payload", async () => {
    const tooShortBytes = new Uint8Array(EncryptionIV.LENGTH);
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => tooShortBytes.buffer } as any);

    expect(adapter.decrypt(recipe)).rejects.toThrow(EncryptionBunAdapterError.InvalidPayload);
  });
});
