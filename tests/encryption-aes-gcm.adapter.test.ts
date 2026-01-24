import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CryptoKeyProviderNoopAdapter } from "../src/crypto-key-provider-noop.adapter";
import { EncryptionAesGcmAdapter } from "../src/encryption-aes-gcm.adapter";
import { EncryptionIV } from "../src/encryption-iv.vo";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { FileReaderRawNoopAdapter } from "../src/file-reader-raw-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import * as mocks from "./mocks";

const iv = new Uint8Array(Array.from({ length: 12 }, (_, i) => i + 1));

const plaintext = new Uint8Array([10, 20, 30, 40, 50]);
const ciphertext = new Uint8Array([201, 202, 203, 204, 205, 206]);

const encryptedFileBytes = new Uint8Array(iv.length + ciphertext.length);
encryptedFileBytes.set(iv, 0);
encryptedFileBytes.set(ciphertext, iv.length);

const recipe = {
  input: tools.FilePathAbsolute.fromString("/tmp/in.bin"),
  output: tools.FilePathAbsolute.fromString("/tmp/out.bin"),
};

const FileWriter = new FileWriterNoopAdapter();
const FileReaderRaw = new FileReaderRawNoopAdapter(plaintext.buffer);
const FileInspection = new FileInspectionNoopAdapter({ exists: true });
const CryptoKeyProvider = new CryptoKeyProviderNoopAdapter();
const deps = { CryptoKeyProvider, FileInspection, FileReaderRaw, FileWriter };

const adapter = new EncryptionAesGcmAdapter(deps);

describe("EncryptionAesGcmAdapter", () => {
  test("encrypt", async () => {
    spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    spyOn(crypto.subtle, "encrypt").mockResolvedValue(ciphertext.buffer);
    const fileWriterWrite = spyOn(FileWriter, "write");

    expect(await adapter.encrypt(recipe)).toEqual(recipe.output);
    expect(fileWriterWrite.mock.calls[0]?.[1]).toEqual(encryptedFileBytes);
  });

  test("encrypt - failure - missing file", async () => {
    spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    const adapter = new EncryptionAesGcmAdapter({
      CryptoKeyProvider,
      FileInspection,
      FileReaderRaw,
      FileWriter,
    });

    expect(async () => adapter.encrypt(recipe)).toThrow("encryption.aes.gcm.adapter.missing.file");
  });

  test("encrypt - failure - read file", async () => {
    spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    const FileInspection = new FileInspectionNoopAdapter({ exists: true });
    const adapter = new EncryptionAesGcmAdapter({
      CryptoKeyProvider,
      FileInspection,
      FileReaderRaw,
      FileWriter,
    });
    spyOn(FileInspection, "exists").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.encrypt(recipe)).toThrow(mocks.IntentionalError);
  });

  test("encrypt - failure - write error", async () => {
    spyOn(EncryptionIV, "generate").mockReturnValue(iv);
    spyOn(crypto.subtle, "encrypt").mockResolvedValue(ciphertext.buffer);
    spyOn(FileWriter, "write").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.encrypt(recipe)).toThrow(mocks.IntentionalError);
  });

  test("decrypt", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(encryptedFileBytes.buffer);
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);
    const fileWriterWrite = spyOn(FileWriter, "write");

    const adapter = new EncryptionAesGcmAdapter({
      CryptoKeyProvider,
      FileInspection,
      FileReaderRaw,
      FileWriter,
    });

    expect(await adapter.decrypt(recipe)).toEqual(recipe.output);
    // @ts-expect-error Coercion
    expect(new Uint8Array(fileWriterWrite.mock.calls[0]?.[1])).toEqual(plaintext);
  });

  test("decrypt - failure - invalid payload", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(new Uint8Array(EncryptionIV.LENGTH).buffer);
    const adapter = new EncryptionAesGcmAdapter({
      CryptoKeyProvider,
      FileInspection,
      FileReaderRaw,
      FileWriter,
    });

    expect(async () => adapter.decrypt(recipe)).toThrow("aes.gcm.crypto.invalid.payload");
  });

  test("decrypt - failure - missing file", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    const adapter = new EncryptionAesGcmAdapter({
      CryptoKeyProvider,
      FileInspection,
      FileReaderRaw,
      FileWriter,
    });

    expect(async () => adapter.decrypt(recipe)).toThrow("encryption.aes.gcm.adapter.missing.file");
  });

  test("decrypt - failure - read error", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: true });
    const adapter = new EncryptionAesGcmAdapter({
      CryptoKeyProvider,
      FileInspection,
      FileReaderRaw,
      FileWriter,
    });
    spyOn(FileInspection, "exists").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.decrypt(recipe)).toThrow(mocks.IntentionalError);
  });

  test("decrypt - failure - write error", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(encryptedFileBytes.buffer);
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);
    spyOn(FileWriter, "write").mockImplementation(mocks.throwIntentionalErrorAsync);

    const adapter = new EncryptionAesGcmAdapter({
      CryptoKeyProvider,
      FileInspection,
      FileReaderRaw,
      FileWriter,
    });

    expect(async () => adapter.decrypt(recipe)).toThrow(mocks.IntentionalError);
  });

  test("view", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(encryptedFileBytes.buffer);
    const adapter = new EncryptionAesGcmAdapter({
      CryptoKeyProvider,
      FileInspection,
      FileReaderRaw,
      FileWriter,
    });
    spyOn(crypto.subtle, "decrypt").mockResolvedValue(plaintext.buffer);

    expect(await adapter.view(recipe.input)).toEqual(plaintext.buffer);
  });

  test("view - failure - invalid payload", async () => {
    const FileReaderRaw = new FileReaderRawNoopAdapter(new Uint8Array(EncryptionIV.LENGTH).buffer);
    const adapter = new EncryptionAesGcmAdapter({
      CryptoKeyProvider,
      FileInspection,
      FileReaderRaw,
      FileWriter,
    });

    expect(async () => adapter.view(recipe.input)).toThrow("aes.gcm.crypto.invalid.payload");
  });

  test("view - failure - missing file", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: false });
    const adapter = new EncryptionAesGcmAdapter({
      CryptoKeyProvider,
      FileInspection,
      FileReaderRaw,
      FileWriter,
    });

    expect(async () => adapter.view(recipe.input)).toThrow("encryption.aes.gcm.adapter.missing.file");
  });
});
