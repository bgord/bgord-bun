import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CryptoKeyProviderNoopAdapter } from "../src/crypto-key-provider-noop.adapter";
import { EncryptionBunAdapter, EncryptionBunAdapterError } from "../src/encryption-bun.adapter";
import { EncryptionIV } from "../src/encryption-iv.vo";

const iv = new Uint8Array(Array.from({ length: 12 }, (_, i) => i + 1));
const plaintext = new Uint8Array([10, 20, 30, 40, 50]);
const ciphertext = new Uint8Array([201, 202, 203, 204, 205, 206]);

const encryptedFileContent = new Uint8Array(iv.length + ciphertext.length);
encryptedFileContent.set(iv, 0);
encryptedFileContent.set(ciphertext, iv.length);

const recipe = {
  input: tools.FilePathAbsolute.fromString("/tmp/in.bin"),
  output: tools.FilePathAbsolute.fromString("/tmp/out.bin"),
};

describe("EncryptionBunAdapter", () => {
  const adapter = new EncryptionBunAdapter({ CryptoKeyProvider: new CryptoKeyProviderNoopAdapter() });

  test("encrypt", async () => {
    spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => plaintext.buffer } as any);
    spyOn(crypto.subtle, "encrypt").mockResolvedValue(ciphertext.buffer);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    expect(await adapter.encrypt(recipe)).toEqual(recipe.output);
    expect(new Uint8Array(bunWrite.mock.calls[0][1] as any)).toEqual(encryptedFileContent);
  });

  test("decrypt", async () => {
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => encryptedFileContent.buffer } as any);
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    expect(await adapter.decrypt(recipe)).toEqual(recipe.output);
    expect(new Uint8Array(bunWrite.mock.calls[0][1] as any)).toEqual(plaintext);
  });

  test("view", async () => {
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => encryptedFileContent.buffer } as any);
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);

    expect(await adapter.view(recipe.input)).toEqual(plaintext.buffer);
  });

  test("failure - invalid payload", async () => {
    spyOn(Bun, "file").mockReturnValue({
      arrayBuffer: async () => new Uint8Array(EncryptionIV.LENGTH).buffer,
    } as any);

    expect(async () => adapter.decrypt(recipe)).toThrow(EncryptionBunAdapterError.InvalidPayload);
  });
});
