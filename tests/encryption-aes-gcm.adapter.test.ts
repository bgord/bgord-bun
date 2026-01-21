import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CryptoKeyProviderNoopAdapter } from "../src/crypto-key-provider-noop.adapter";
import { EncryptionAesGcmAdapter } from "../src/encryption-aes-gcm.adapter";
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

describe("EncryptionAesGcmAdapter", () => {
  const adapter = new EncryptionAesGcmAdapter({ CryptoKeyProvider: new CryptoKeyProviderNoopAdapter() });

  test("encrypt", async () => {
    spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    spyOn(Bun, "file").mockReturnValue({ exists: () => true, arrayBuffer: () => plaintext.buffer } as any);
    spyOn(crypto.subtle, "encrypt").mockResolvedValue(ciphertext.buffer);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    expect(await adapter.encrypt(recipe)).toEqual(recipe.output);
    // @ts-expect-error
    expect(new Uint8Array(bunWrite.mock.calls[0]?.[1])).toEqual(encryptedFileContent);
  });

  test("encrypt - missing file", async () => {
    spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    spyOn(Bun, "file").mockReturnValue({ exists: () => false, arrayBuffer: () => plaintext.buffer } as any);

    expect(async () => adapter.encrypt(recipe)).toThrow("encryption.aes.gcm.adapter.missing.file");
  });

  test("decrypt", async () => {
    spyOn(Bun, "file").mockReturnValue({
      exists: () => true,
      arrayBuffer: () => encryptedFileContent.buffer,
    } as any);
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    expect(await adapter.decrypt(recipe)).toEqual(recipe.output);
    // @ts-expect-error
    expect(new Uint8Array(bunWrite.mock.calls[0]?.[1])).toEqual(plaintext);
  });

  test("decrypt - failure - invalid payload", async () => {
    spyOn(Bun, "file").mockReturnValue({
      exists: () => true,
      arrayBuffer: () => new Uint8Array(EncryptionIV.LENGTH).buffer,
    } as any);

    expect(async () => adapter.decrypt(recipe)).toThrow("aes.gcm.crypto.invalid.payload");
  });

  test("decrypt - failure - missing file", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: () => false } as any);

    expect(async () => adapter.decrypt(recipe)).toThrow("encryption.aes.gcm.adapter.missing.file");
  });

  test("view", async () => {
    spyOn(Bun, "file").mockReturnValue({
      exists: () => true,
      arrayBuffer: () => encryptedFileContent.buffer,
    } as any);
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);

    expect(await adapter.view(recipe.input)).toEqual(plaintext.buffer);
  });

  test("view - failure - invalid payload", async () => {
    spyOn(Bun, "file").mockReturnValue({
      exists: () => true,
      arrayBuffer: () => new Uint8Array(EncryptionIV.LENGTH).buffer,
    } as any);

    expect(async () => adapter.view(recipe.input)).toThrow("aes.gcm.crypto.invalid.payload");
  });

  test("view - failure - missing file", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: () => false } as any);

    expect(async () => adapter.view(recipe.input)).toThrow("encryption.aes.gcm.adapter.missing.file");
  });
});
