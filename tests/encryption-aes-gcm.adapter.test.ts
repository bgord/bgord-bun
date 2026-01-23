import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CryptoKeyProviderNoopAdapter } from "../src/crypto-key-provider-noop.adapter";
import { EncryptionAesGcmAdapter } from "../src/encryption-aes-gcm.adapter";
import { EncryptionIV } from "../src/encryption-iv.vo";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { FileReaderRawNoopAdapter } from "../src/file-reader-raw-noop.adapter";

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

const FileReaderRaw = new FileReaderRawNoopAdapter(plaintext.buffer);
const FileInspection = new FileInspectionNoopAdapter({ exists: true });
const CryptoKeyProvider = new CryptoKeyProviderNoopAdapter();
const deps = { CryptoKeyProvider, FileInspection, FileReaderRaw };

const adapter = new EncryptionAesGcmAdapter(deps);

describe("EncryptionAesGcmAdapter", () => {
  test("encrypt", async () => {
    spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    spyOn(crypto.subtle, "encrypt").mockResolvedValue(ciphertext.buffer);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    expect(await adapter.encrypt(recipe)).toEqual(recipe.output);
    // @ts-expect-error
    expect(new Uint8Array(bunWrite.mock.calls[0]?.[1])).toEqual(encryptedFileContent);
  });

  test("encrypt - missing file", async () => {
    spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    const adapter = new EncryptionAesGcmAdapter({ CryptoKeyProvider, FileInspection, FileReaderRaw });

    expect(async () => adapter.encrypt(recipe)).toThrow("encryption.aes.gcm.adapter.missing.file");
  });

  test("decrypt", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(encryptedFileContent.buffer);
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    const adapter = new EncryptionAesGcmAdapter({ CryptoKeyProvider, FileInspection, FileReaderRaw });

    expect(await adapter.decrypt(recipe)).toEqual(recipe.output);
    // @ts-expect-error
    expect(new Uint8Array(bunWrite.mock.calls[0]?.[1])).toEqual(plaintext);
  });

  test("decrypt - failure - invalid payload", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(new Uint8Array(EncryptionIV.LENGTH).buffer);
    const adapter = new EncryptionAesGcmAdapter({ CryptoKeyProvider, FileInspection, FileReaderRaw });

    expect(async () => adapter.decrypt(recipe)).toThrow("aes.gcm.crypto.invalid.payload");
  });

  test("decrypt - failure - missing file", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    const adapter = new EncryptionAesGcmAdapter({ CryptoKeyProvider, FileInspection, FileReaderRaw });

    expect(async () => adapter.decrypt(recipe)).toThrow("encryption.aes.gcm.adapter.missing.file");
  });

  test("view", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(encryptedFileContent.buffer);
    const adapter = new EncryptionAesGcmAdapter({ CryptoKeyProvider, FileInspection, FileReaderRaw });
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);

    expect(await adapter.view(recipe.input)).toEqual(plaintext.buffer);
  });

  test("view - failure - invalid payload", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(new Uint8Array(EncryptionIV.LENGTH).buffer);
    const adapter = new EncryptionAesGcmAdapter({ CryptoKeyProvider, FileInspection, FileReaderRaw });

    expect(async () => adapter.view(recipe.input)).toThrow("aes.gcm.crypto.invalid.payload");
  });

  test("view - failure - missing file", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    const adapter = new EncryptionAesGcmAdapter({ CryptoKeyProvider, FileInspection, FileReaderRaw });

    expect(async () => adapter.view(recipe.input)).toThrow("encryption.aes.gcm.adapter.missing.file");
  });
});
