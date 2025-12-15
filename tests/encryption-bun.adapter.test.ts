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
    spyOn(Bun, "file").mockReturnValue({ exists: () => true, arrayBuffer: () => plaintext.buffer } as any);
    spyOn(crypto.subtle, "encrypt").mockResolvedValue(ciphertext.buffer);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    expect(await adapter.encrypt(recipe)).toEqual(recipe.output);
    expect(new Uint8Array(bunWrite.mock.calls[0][1] as any)).toEqual(encryptedFileContent);
  });

  test("encrypt", async () => {
    spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    spyOn(Bun, "file").mockReturnValue({ exists: () => false, arrayBuffer: () => plaintext.buffer } as any);

    expect(async () => adapter.encrypt(recipe)).toThrow(EncryptionBunAdapterError.MissingFile);
  });

  test("decrypt", async () => {
    spyOn(Bun, "file").mockReturnValue({
      exists: () => true,
      arrayBuffer: () => encryptedFileContent.buffer,
    } as any);
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    expect(await adapter.decrypt(recipe)).toEqual(recipe.output);
    expect(new Uint8Array(bunWrite.mock.calls[0][1] as any)).toEqual(plaintext);
  });

  test("decrypt - failure - invalid payload", async () => {
    spyOn(Bun, "file").mockReturnValue({
      exists: () => true,
      arrayBuffer: () => new Uint8Array(EncryptionIV.LENGTH).buffer,
    } as any);

    expect(async () => adapter.decrypt(recipe)).toThrow(EncryptionBunAdapterError.InvalidPayload);
  });

  test("decrypt - failure - missing file", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: () => false } as any);

    expect(async () => adapter.decrypt(recipe)).toThrow(EncryptionBunAdapterError.MissingFile);
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

    expect(async () => adapter.view(recipe.input)).toThrow(EncryptionBunAdapterError.InvalidPayload);
  });

  test("view - failure - missing file", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: () => false } as any);

    expect(async () => adapter.view(recipe.input)).toThrow(EncryptionBunAdapterError.MissingFile);
  });
});
